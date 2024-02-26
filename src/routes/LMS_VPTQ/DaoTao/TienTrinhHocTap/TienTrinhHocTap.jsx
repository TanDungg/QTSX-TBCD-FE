import { Card, Col, DatePicker, Image, Row, Tag } from "antd";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeDuplicates,
  reDataForTable,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { EditableTableRow, Select, Table } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";
import { BASE_URL_API } from "src/constants/Config";

const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;

function TienTrinhHocTap({ permission, history }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [Data, setData] = useState([]);
  const [IsQuanLy, setIsQuanLy] = useState(false);
  const [ListDonVi, setListDonVi] = useState([]);
  const [DonVi, setDonVi] = useState(null);
  const [ListHocVien, setListHocVien] = useState([]);
  const [HocVien, setHocVien] = useState(null);
  const [TuNgay, setTuNgay] = useState();
  const [DenNgay, setDenNgay] = useState();

  useEffect(() => {
    if (permission && permission.view) {
      getIsQuanLy();
      getListDonVi();
      getListHocVien();
      setDonVi(INFO.donVi_Id.toLowerCase());
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getIsQuanLy = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/is-ql-hoc-truc-tuyen?donViHienHanh_Id=${INFO.donVi_Id}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res) {
        setIsQuanLy(res.data);
      }
    });
  };

  const getListData = (donVi_Id, user_Id, tuNgay, denNgay) => {
    let param = convertObjectToUrlParams({
      donViHienHanh_Id: INFO.donVi_Id,
      donVi_Id,
      user_Id,
      tuNgay,
      denNgay,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/tien-trinh-hoc-tap?${param}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        setData(res.data);
      } else {
        setData([]);
      }
    });
  };

  const getListDonVi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonVi/don-vi-by-user`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListDonVi(res.data);
        } else {
          setListDonVi([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListHocVien = (donviId) => {
    const params = convertObjectToUrlParams({
      donviId: donviId ? donviId : INFO.donVi_Id.toLowerCase(),
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/get-cbnv?${params}&key=1`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          if (donviId) {
            setHocVien(res.data[0].user_Id);
            getListData(donviId, res.data[0].user_Id, TuNgay, DenNgay);
          } else {
            setHocVien(INFO.user_Id.toLowerCase());
            getListData(INFO.donVi_Id, INFO.user_Id, TuNgay, DenNgay);
          }
          setListHocVien(res.data);
        } else {
          setListHocVien([]);
        }
      })
      .catch((error) => console.error(error));
  };

  let dataList = reDataForTable(Data.list_ChiTiets);

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Chứng nhận",
      dataIndex: "giayChungNhan",
      key: "giayChungNhan",
      width: 100,
      align: "center",
      render: (value) =>
        value && (
          <span>
            <Image
              src={BASE_URL_API + value}
              alt="Hình ảnh"
              style={{ maxWidth: 70, maxHeight: 70 }}
            />
          </span>
        ),
    },
    {
      title: "Chuyên đề đào tạo",
      dataIndex: "tenChuyenDeDaoTao",
      key: "tenChuyenDeDaoTao",
      align: "left",
      width: 250,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenChuyenDeDaoTao,
            value: d.tenChuyenDeDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenChuyenDeDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên lớp học",
      dataIndex: "tenLopHoc",
      key: "tenLopHoc",
      align: "left",
      width: 200,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenLopHoc,
            value: d.tenLopHoc,
          };
        })
      ),
      onFilter: (value, record) => record.tenLopHoc.includes(value),
      filterSearch: true,
    },
    {
      title: "Hình thức đào tạo",
      dataIndex: "tenHinhThucDaoTao",
      key: "tenHinhThucDaoTao",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenHinhThucDaoTao,
            value: d.tenHinhThucDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenHinhThucDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: (
        <div>
          Thời gian
          <br />
          đào tạo
        </div>
      ),
      dataIndex: "thoiGianDaoTao",
      key: "thoiGianDaoTao",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.thoiGianDaoTao,
            value: d.thoiGianDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.thoiGianDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: (
        <div>
          Thời gian
          <br />
          kết thúc
        </div>
      ),
      dataIndex: "thoiGianKetThuc",
      key: "thoiGianKetThuc",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.thoiGianKetThuc,
            value: d.thoiGianKetThuc,
          };
        })
      ),
      onFilter: (value, record) => record.thoiGianKetThuc.includes(value),
      filterSearch: true,
    },

    {
      title: (
        <div>
          Thời gian
          <br />
          hoàn thành
        </div>
      ),
      dataIndex: "thoiGianHoanThanh",
      key: "thoiGianHoanThanh",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.thoiGianHoanThanh,
            value: d.thoiGianHoanThanh,
          };
        })
      ),
      onFilter: (value, record) => record.thoiGianHoanThanh.includes(value),
      filterSearch: true,
    },
    {
      title: "Số điểm",
      dataIndex: "soDiem",
      key: "soDiem",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.soDiem,
            value: d.soDiem,
          };
        })
      ),
      onFilter: (value, record) =>
        record.soDiem && record.soDiem.toString().includes(value),
      filterSearch: true,
      render: (value) => {
        return value !== null && <span>{value} điểm</span>;
      },
    },
    {
      title: "Hoàn thành",
      dataIndex: "tyLe",
      key: "tyLe",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tyLe,
            value: d.tyLe,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tyLe && record.tyLe.toString().includes(value),
      filterSearch: true,
      render: (value) => {
        return value !== null && <span>{value} %</span>;
      },
    },
    {
      title: "Đánh giá",
      dataIndex: "isDat",
      key: "isDat",
      align: "center",
      width: 100,
      render: (value) => {
        return (
          value !== null && (
            <span
              style={{
                fontWeight: "bold",
                color: value === true ? "#0469b9" : "red",
              }}
            >
              {value === true ? "Đạt" : value === false ? "Không đạt" : ""}
            </span>
          )
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.trangThai,
            value: d.trangThai,
          };
        })
      ),
      onFilter: (value, record) => record.trangThai.includes(value),
      filterSearch: true,
      render: (value) =>
        value && (
          <Tag
            color={
              value === "Chưa hoàn thành"
                ? "cyan"
                : value === "Đã học, chưa thi"
                ? "orange"
                : value === "Hoàn thành"
                ? "blue"
                : value === "Chưa học"
                ? ""
                : "red"
            }
            style={{
              whiteSpace: "break-spaces",
              fontSize: 13,
            }}
          >
            {value}
          </Tag>
        ),
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(colValues, (col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        info: col.info,
      }),
    };
  });

  const handleOnSelectDonVi = (value) => {
    setDonVi(value);
    setHocVien(null);
    getListHocVien(value);
  };

  const handleOnSelectHocVien = (value) => {
    setHocVien(value);
    getListData(DonVi, value, TuNgay, DenNgay);
  };

  const handleChangeNgay = (dateString) => {
    setTuNgay(dateString[0]);
    setDenNgay(dateString[1]);
    getListData(DonVi, HocVien, dateString[0], dateString[1]);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Tiến trình học tập"}
        description="Kết quả tiến trình học tập"
      />
      {IsQuanLy === true && (
        <Card className="th-card-margin-bottom ">
          <Row>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <span>Đơn vị:</span>
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListDonVi ? ListDonVi : []}
                placeholder="Chọn đơn vị đào tạo"
                optionsvalue={["id", "tenDonVi"]}
                style={{ width: "100%" }}
                value={DonVi}
                showSearch
                optionFilterProp={"name"}
                onSelect={handleOnSelectDonVi}
              />
            </Col>
            <Col
              xxl={6}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <span>Học viên:</span>
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListHocVien ? ListHocVien : []}
                placeholder="Chọn đơn vị đào tạo"
                optionsvalue={["id", "fullName"]}
                style={{ width: "100%" }}
                value={HocVien}
                showSearch
                optionFilterProp={"name"}
                onSelect={handleOnSelectHocVien}
              />
            </Col>
            <Col
              xxl={6}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: 8,
              }}
            >
              <span>Ngày:</span>
              <RangePicker
                format={"DD/MM/YYYY"}
                style={{ width: "85%" }}
                onChange={(date, dateString) => handleChangeNgay(dateString)}
                allowClear={true}
              />
            </Col>
          </Row>
        </Card>
      )}
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row gutter={[0, 10]}>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                width: "85px",
                fontWeight: "bold",
              }}
            >
              Họ và tên:
            </span>
            {Data && (
              <span
                style={{
                  width: "calc(100% - 85px)",
                }}
              >
                {Data.fullName}
              </span>
            )}
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                width: "110px",
                fontWeight: "bold",
              }}
            >
              Mã nhân viên:
            </span>
            {Data && (
              <span
                style={{
                  width: "calc(100% - 110px)",
                }}
              >
                {Data.maNhanVien}
              </span>
            )}
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                width: "85px",
                fontWeight: "bold",
              }}
            >
              Ngày sinh:
            </span>
            {Data && (
              <span
                style={{
                  width: "calc(100% - 85px)",
                }}
              >
                {Data.ngaySinh}
              </span>
            )}
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                width: "90px",
                fontWeight: "bold",
              }}
            >
              Chức danh:
            </span>
            {Data && (
              <span
                style={{
                  width: "calc(100% - 90px)",
                }}
              >
                {Data.tenChucDanh}
              </span>
            )}
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                width: "80px",
                fontWeight: "bold",
              }}
            >
              Chức vụ:
            </span>
            {Data && (
              <span
                style={{
                  width: "calc(100% - 80px)",
                }}
              >
                {Data.tenChucVu}
              </span>
            )}
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                width: "95px",
                fontWeight: "bold",
              }}
            >
              Phòng ban:
            </span>
            {Data && (
              <span
                style={{
                  width: "calc(100% - 95px)",
                }}
              >
                {Data.tenPhongBan}
              </span>
            )}
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                width: "60px",
                fontWeight: "bold",
              }}
            >
              Đơn vị:
            </span>
            {Data && (
              <span
                style={{
                  width: "calc(100% - 60px)",
                }}
              >
                {Data.tenDonVi}
              </span>
            )}
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                width: "140px",
                fontWeight: "bold",
              }}
            >
              Số lượng đăng ký:
            </span>
            {Data && (
              <span
                style={{
                  width: "calc(100% - 140px)",
                }}
              >
                {Data.soLuongDangKy} chuyên đề
              </span>
            )}
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                width: "160px",
                fontWeight: "bold",
              }}
            >
              Số lượng hoàn thành:
            </span>
            {Data && (
              <span
                style={{
                  width: "calc(100% - 160px)",
                }}
              >
                {Data.soLuongHoanThanh} chuyên đề
              </span>
            )}
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1500, y: "36vh" }}
          components={components}
          className="gx-table-responsive th-table"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default TienTrinhHocTap;
