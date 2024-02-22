import {
  EditOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Card,
  Col,
  Divider,
  Modal as AntModal,
  Row,
  Tag,
  DatePicker,
  Checkbox,
} from "antd";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeDuplicates,
  reDataForTable,
  getNgayDauThang,
  getNgayCuoiThang,
  getDateTimeNow,
  getDateNow,
} from "src/util/Common";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { EditableTableRow, Select, Table } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";
import { Link } from "react-router-dom";
import moment from "moment";
import numeral from "numeral";
import { BASE_URL_API } from "src/constants/Config";

const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;

function XacNhanDaoTao({ match, permission, history }) {
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [ListKienThuc, setListKienThuc] = useState([]);
  const [KienThuc, setKienThuc] = useState(null);
  const [ListChuyenDeDaoTao, setListChuyenDeDaoTao] = useState([]);
  const [ChuyenDeDaoTao, setChuyenDeDaoTao] = useState(null);
  const [ListLopHoc, setListLopHoc] = useState([]);
  const [LopHoc, setLopHoc] = useState(null);
  const [TuNgay, setTuNgay] = useState(getNgayDauThang());
  const [DenNgay, setDenNgay] = useState(getNgayCuoiThang());
  const [page, setPage] = useState(1);
  const [DataChiTiet, setDataChiTiet] = useState(null);
  const [ListHocVien, setListHocVien] = useState([]);
  const [ActiveChiTietLopHoc, setActiveChiTietLopHoc] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getListFilter(KienThuc, ChuyenDeDaoTao, TuNgay, DenNgay);
      getListData(KienThuc, ChuyenDeDaoTao, LopHoc, TuNgay, DenNgay, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (
    vptq_lms_KienThuc_Id,
    vptq_lms_ChuyenDeDaoTao_Id,
    vptq_lms_LopHoc_Id,
    tuNgay,
    denNgay,
    page
  ) => {
    let param = convertObjectToUrlParams({
      vptq_lms_KienThuc_Id,
      vptq_lms_ChuyenDeDaoTao_Id,
      vptq_lms_LopHoc_Id,
      tuNgay,
      denNgay,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_XacNhanDaoTao/danh-sach-lop-hoc?${param}`,
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

  const getListFilter = (
    vptq_lms_KienThuc_Id,
    vptq_lms_ChuyenDeDaoTao_Id,
    tuNgay,
    denNgay
  ) => {
    const param = convertObjectToUrlParams({
      vptq_lms_KienThuc_Id,
      vptq_lms_ChuyenDeDaoTao_Id,
      tuNgay,
      denNgay,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ThiTrucTuyen/filter-thi-truc-tuyen?${param}`,
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
          setListKienThuc(res.data.list_KienThucs);
          setListChuyenDeDaoTao(res.data.list_ChuyenDeDaoTaos);
          setListLopHoc(res.data.list_LopHocs);
        } else {
          setListKienThuc([]);
          setListChuyenDeDaoTao([]);
          setListLopHoc([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(KienThuc, ChuyenDeDaoTao, LopHoc, TuNgay, DenNgay, pagination);
  };

  const handleXemChiTiet = (item) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_XacNhanDaoTao/${item.id}`,
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
          setDataChiTiet(res.data);
          const chitiet =
            res.data.list_ChiTiets && JSON.parse(res.data.list_ChiTiets);
          setListHocVien(chitiet);
        } else {
          setDataChiTiet(null);
          setListHocVien([]);
        }
      })
      .catch((error) => console.error(error));
    setActiveChiTietLopHoc(true);
  };

  const actionContent = (item) => {
    const xacnhan =
      item.isXacNhanDaoTao && item.thoiGianDaoTao <= getDateTimeNow() ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/xac-nhan-danh-sach`,
            state: { itemData: item, permission },
          }}
          title="Xác nhận đào tạo"
        >
          <SettingOutlined />
        </Link>
      ) : (
        <span disabled title="Xác nhận đào tạo">
          <SettingOutlined />
        </span>
      );

    const chinhsua =
      item.thoiGianKetThuc >= getDateNow() &&
      item.thoiGianDaoTao <= getDateTimeNow() ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua-danh-sach`,
            state: { itemData: item, permission },
          }}
          title="Chỉnh sửa xác nhận đào tạo"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Chỉnh sửa xác nhận đào tạo">
          <EditOutlined />
        </span>
      );

    const chitiet = { onClick: () => handleXemChiTiet(item) };

    return (
      <div>
        <React.Fragment>
          {xacnhan}
          <Divider type="vertical" />
          {chinhsua}
          <Divider type="vertical" />
          <a {...chitiet} title="Xem chi tiết lớp học">
            <SearchOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  const { totalRow } = Data;
  let dataList = reDataForTable(Data.datalist);

  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 100,
      render: (value) => actionContent(value),
      fixed: "left",
    },
    {
      title: "Mã lớp học",
      dataIndex: "maLopHoc",
      key: "maLopHoc",
      align: "center",
      width: 120,
      fixed: width >= 1600 && "left",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maLopHoc,
            value: d.maLopHoc,
          };
        })
      ),
      onFilter: (value, record) => record.maLopHoc.includes(value),
      filterSearch: true,
    },
    {
      title: "Lớp học",
      dataIndex: "tenLopHoc",
      key: "tenLopHoc",
      align: "left",
      width: 200,
      fixed: width >= 1600 && "left",
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
      title: "Chuyên đề",
      dataIndex: "tenChuyenDeDaoTao",
      key: "tenChuyenDeDaoTao",
      align: "left",
      width: 200,
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
          Thời lượng
          <br />
          đào tạo
        </div>
      ),
      dataIndex: "thoiLuongDaoTao",
      key: "thoiLuongDaoTao",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.thoiLuongDaoTao,
            value: d.thoiLuongDaoTao,
          };
        })
      ),
      onFilter: (value, record) =>
        record.thoiLuongDaoTao.toString().includes(value),
      filterSearch: true,
      render: (value) => {
        return value && <span>{value} phút</span>;
      },
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          học viên
        </div>
      ),
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
      width: 100,
      render: (value) => {
        return value && <span>{value} học viên</span>;
      },
    },
    {
      title: "Người đăng ký",
      dataIndex: "tenNguoiTao",
      key: "tenNguoiTao",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenNguoiTao,
            value: d.tenNguoiTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenNguoiTao.includes(value),
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
      title: "Địa điểm đào tạo",
      dataIndex: "diaDiem",
      key: "diaDiem",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.diaDiem,
            value: d.diaDiem,
          };
        })
      ),
      onFilter: (value, record) => record.diaDiem.includes(value),
      filterSearch: true,
    },
    {
      title: "File báo cáo",
      dataIndex: "fileBaoCao",
      key: "fileBaoCao",
      align: "left",
      width: 200,
      render: (value) => {
        return (
          value && (
            <span>
              <a
                target="_blank"
                href={BASE_URL_API + value}
                rel="noopener noreferrer"
              >
                {value.split("/")[5]}
              </a>
            </span>
          )
        );
      },
    },
    {
      title: "Tình trạng",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tinhTrang,
            value: d.tinhTrang,
          };
        })
      ),
      onFilter: (value, record) => record.tinhTrang.includes(value),
      filterSearch: true,
      render: (value, record) =>
        value && (
          <Tag
            color={value === "Chưa hoàn thành" ? "red" : "blue"}
            style={{
              whiteSpace: "break-spaces",
              fontSize: 13,
            }}
          >
            {value}
          </Tag>
        ),
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 120,
    },
  ];

  let columnhocvien = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      align: "center",
      width: 100,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      align: "left",
      width: 150,
    },
    {
      title: "Ngày sinh",
      dataIndex: "ngaySinh",
      key: "ngaySinh",
      align: "center",
      width: 100,
    },
    {
      title: "Chức danh",
      dataIndex: "tenChucDanh",
      key: "tenChucDanh",
      align: "center",
      width: 150,
    },
    {
      title: "Phòng ban",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      align: "left",
      width: 150,
    },
    {
      title: "Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      align: "left",
      width: 200,
    },
    {
      title: "Điểm danh",
      dataIndex: "isDiemDanh",
      key: "isDiemDanh",
      align: "center",
      width: 90,
      render: (value) => {
        return <Checkbox checked={value} disabled />;
      },
    },
    {
      title: (
        <div>
          Tình trạng
          <br />
          vắng có phép
        </div>
      ),
      dataIndex: "isVangCoPhep",
      key: "isVangCoPhep",
      align: "center",
      width: 90,
      render: (value) => {
        return <Checkbox checked={value} disabled />;
      },
    },
    {
      title: (
        <div>
          Học phí
          <br />
          (VNĐ)
        </div>
      ),
      dataIndex: "hocPhi",
      key: "hocPhi",
      align: "center",
      width: 100,
      render: (value) => {
        return <span>{numeral(value).format("0,0 VNĐ")} (VNĐ)</span>;
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "left",
      width: 120,
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

  const handleOnSelectKienThuc = (value) => {
    setKienThuc(value);
    setChuyenDeDaoTao(null);
    setLopHoc(null);
    getListFilter(value, null, TuNgay, DenNgay);
    getListData(value, null, null, TuNgay, DenNgay, page);
  };

  const handleClearKienThuc = () => {
    setKienThuc(null);
    setChuyenDeDaoTao(null);
    setLopHoc(null);
    getListFilter(null, null, TuNgay, DenNgay);
    getListData(null, null, null, TuNgay, DenNgay, page);
  };

  const handleOnSelectChuyenDeDaoTao = (value) => {
    setChuyenDeDaoTao(value);
    setLopHoc(null);
    getListFilter(KienThuc, value, TuNgay, DenNgay);
    getListData(KienThuc, value, null, TuNgay, DenNgay, page);
  };

  const handleClearChuyenDeDaoTao = () => {
    setChuyenDeDaoTao(null);
    setLopHoc(null);
    getListFilter(KienThuc, null, TuNgay, DenNgay);
    getListData(KienThuc, null, null, TuNgay, DenNgay, page);
  };

  const handleOnSelectLopHoc = (value) => {
    setLopHoc(value);
    getListData(KienThuc, ChuyenDeDaoTao, value, TuNgay, DenNgay, page);
  };

  const handleClearLopHoc = () => {
    setLopHoc(null);
    getListData(KienThuc, ChuyenDeDaoTao, null, TuNgay, DenNgay, page);
  };

  const handleChangeNgay = (dateString) => {
    setTuNgay(dateString[0]);
    setDenNgay(dateString[1]);
    getListFilter(KienThuc, ChuyenDeDaoTao, dateString[0], dateString[1]);
    getListData(
      KienThuc,
      ChuyenDeDaoTao,
      LopHoc,
      dateString[0],
      dateString[1],
      page
    );
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Xác nhận đào tạo"}
        description="Danh sách xác nhận đào tạo"
      />
      <Card className="th-card-margin-bottom ">
        <Row>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <span>Kiến thức:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListKienThuc ? ListKienThuc : []}
              placeholder="Chọn kiến thức"
              optionsvalue={["vptq_lms_KienThuc_Id", "tenKienThuc"]}
              style={{ width: "100%" }}
              value={KienThuc}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectKienThuc}
              allowClear
              onClear={handleClearKienThuc}
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
            <span>Chuyên đề đào tạo:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListChuyenDeDaoTao ? ListChuyenDeDaoTao : []}
              placeholder="Chọn chuyên đề đào tạo"
              optionsvalue={["vptq_lms_ChuyenDeDaoTao_Id", "tenChuyenDeDaoTao"]}
              style={{ width: "100%" }}
              value={ChuyenDeDaoTao}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectChuyenDeDaoTao}
              allowClear
              onClear={handleClearChuyenDeDaoTao}
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
            <span>Lớp học:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListLopHoc ? ListLopHoc : []}
              placeholder="Chọn lớp học"
              optionsvalue={["vptq_lms_LopHoc_Id", "tenLopHoc"]}
              style={{ width: "100%" }}
              value={LopHoc}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectLopHoc}
              allowClear
              onClear={handleClearLopHoc}
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
              defaultValue={[
                moment(TuNgay, "DD/MM/YYYY"),
                moment(DenNgay, "DD/MM/YYYY"),
              ]}
              allowClear={false}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1900, y: "48vh" }}
          components={components}
          className="gx-table-responsive th-table"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={{
            onChange: handleTableChange,
            pageSize: 20,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
        />
      </Card>
      <AntModal
        title={"Chi tiết lớp học"}
        className="th-card-reset-margin"
        open={ActiveChiTietLopHoc}
        width={width >= 1600 ? `85%` : "100%"}
        closable={true}
        onCancel={() => setActiveChiTietLopHoc(false)}
        footer={null}
      >
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row gutter={[0, 10]}>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
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
                Tên lớp học:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 95px)",
                  }}
                >
                  {DataChiTiet.tenLopHoc}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "145px",
                  fontWeight: "bold",
                }}
              >
                Chuyên đề đào tạo:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 145px)",
                  }}
                >
                  {DataChiTiet.tenChuyenDeDaoTao}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "145px",
                  fontWeight: "bold",
                }}
              >
                Hình thức đào tạo:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 145px)",
                  }}
                >
                  {DataChiTiet.tenHinhThucDaoTao}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "135px",
                  fontWeight: "bold",
                }}
              >
                Thời gian đào tạo:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 135px)",
                  }}
                >
                  {DataChiTiet.thoiGianDaoTao}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "150px",
                  fontWeight: "bold",
                }}
              >
                Thời lượng đào tạo:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 150px)",
                  }}
                >
                  {DataChiTiet.thoiLuongDaoTao} phút
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "115px",
                  fontWeight: "bold",
                }}
              >
                Người đăng ký:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 115px)",
                  }}
                >
                  {DataChiTiet.tenNguoiTao}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "135px",
                  fontWeight: "bold",
                }}
              >
                Tổng số học viên:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 135px)",
                  }}
                >
                  {DataChiTiet.soLuongDiemDanh} học viên
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "135px",
                  fontWeight: "bold",
                }}
              >
                Địa điểm đào tạo:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 135px)",
                  }}
                >
                  {DataChiTiet.diaDiem}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
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
                Người duyệt:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 110px)",
                  }}
                >
                  {DataChiTiet.tenNguoiDuyet}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "105px",
                  fontWeight: "bold",
                }}
              >
                Thi khảo sát:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 105px)",
                  }}
                >
                  <Checkbox
                    checked={DataChiTiet.isThi}
                    style={{ marginTop: "-10px" }}
                    disabled
                  />
                </span>
              )}
            </Col>
            {DataChiTiet && DataChiTiet.tenDeThi && (
              <Col
                xxl={8}
                xl={12}
                lg={12}
                md={24}
                sm={24}
                xs={24}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    width: "65px",
                    fontWeight: "bold",
                  }}
                >
                  Đề thi:
                </span>
                {DataChiTiet && (
                  <span
                    style={{
                      width: "calc(100% - 65px)",
                    }}
                  >
                    {DataChiTiet.tenDeThi}
                  </span>
                )}
              </Col>
            )}
            {DataChiTiet && DataChiTiet.fileBaoCao && (
              <Col
                xxl={8}
                xl={12}
                lg={12}
                md={24}
                sm={24}
                xs={24}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    width: "100px",
                    fontWeight: "bold",
                  }}
                >
                  File báo cáo:
                </span>
                {DataChiTiet && (
                  <span
                    style={{
                      width: "calc(100% - 100px)",
                    }}
                  >
                    <a
                      target="_blank"
                      href={BASE_URL_API + DataChiTiet.fileBaoCao}
                      rel="noopener noreferrer"
                    >
                      {DataChiTiet.fileBaoCao.split("/")[5]}
                    </a>
                  </span>
                )}
              </Col>
            )}
          </Row>
        </Card>
        <Card
          className="th-card-margin-bottom th-card-reset-margin"
          title={"Danh sách học viên"}
        >
          <Table
            bordered
            columns={columnhocvien}
            components={components}
            scroll={{ x: 1350, y: "30vh" }}
            className="gx-table-responsive th-table"
            dataSource={reDataForTable(ListHocVien)}
            size="small"
            loading={loading}
            pagination={false}
          />
        </Card>
      </AntModal>
    </div>
  );
}

export default XacNhanDaoTao;
