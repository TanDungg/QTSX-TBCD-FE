import React, { useState, useEffect } from "react";
import { Card, Button, Row, Modal as AntModal, Col, Tag } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import { Table, Toolbar, Select, Modal } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  removeDuplicates,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import ModalTuChoi from "./ModalTuChoi";

function DuyetLopHoc({ history, permission }) {
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [ListChuyenDe, setListChuyenDe] = useState([]);
  const [ChuyenDe, setChuyenDe] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [SelectedLopHoc, setSelectedLopHoc] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);
  const [ChiTietLopHoc, setChiTietLopHoc] = useState(null);
  const [ActiveModalChiTiet, setActiveModalChiTiet] = useState(false);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getListChuyenDe();
      getListData(ChuyenDe, keyword);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (vptq_lms_ChuyenDeDaoTao_Id, keyword) => {
    let param = convertObjectToUrlParams({
      vptq_lms_ChuyenDeDaoTao_Id,
      keyword,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_LopHoc/chua-duyet?${param}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setData(res.data);
        } else {
          setData([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListChuyenDe = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ChuyenDeDaoTao?page=-1`,
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
          setListChuyenDe(res.data);
        } else {
          setListChuyenDe([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getDataChiTiet = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_LopHoc/${id}`,
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
          const chitiet = {
            ...res.data,
            list_ChiTiets:
              res.data.list_ChiTiets && JSON.parse(res.data.list_ChiTiets),
          };
          setChiTietLopHoc(chitiet);
        }
        setActiveModalChiTiet(true);
      })
      .catch((error) => console.error(error));
  };

  const onSearchCBNV = () => {
    getListData(ChuyenDe, keyword);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(ChuyenDe, val.target.value);
    }
  };

  const hanldeXemChiTiet = (item) => {
    getDataChiTiet(item.id);
  };

  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
      fixed: width > 1600 && "left",
    },
    {
      title: "Mã lớp học",
      dataIndex: "maLopHoc",
      key: "maLopHoc",
      align: "center",
      width: 120,
      render: (value, record) => {
        return (
          <div
            style={{ color: "#0469b9", cursor: "pointer" }}
            onClick={() => {
              hanldeXemChiTiet(record);
            }}
          >
            {value}
          </div>
        );
      },
      fixed: width > 1600 && "left",
      filters: removeDuplicates(
        map(Data, (d) => {
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
      title: "Tên lớp học",
      dataIndex: "tenLopHoc",
      key: "tenLopHoc",
      align: "left",
      width: 150,
      fixed: width > 1600 && "left",
      filters: removeDuplicates(
        map(Data, (d) => {
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
      title: "Chuyên đề đào tạo",
      dataIndex: "tenChuyenDeDaoTao",
      key: "tenChuyenDeDaoTao",
      align: "left",
      width: 200,
      filters: removeDuplicates(
        map(Data, (d) => {
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
      width: 120,
      filters: removeDuplicates(
        map(Data, (d) => {
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
      width: 120,
      filters: removeDuplicates(
        map(Data, (d) => {
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
        map(Data, (d) => {
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
        return <span>{value} phút</span>;
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
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.soLuong,
            value: d.soLuong,
          };
        })
      ),
      onFilter: (value, record) => record.soLuong.toString().includes(value),
      filterSearch: true,
    },
    {
      title: "Người đăng ký",
      dataIndex: "tenNguoiTao",
      key: "tenNguoiTao",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(Data, (d) => {
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
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(Data, (d) => {
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
      width: 160,
      filters: removeDuplicates(
        map(Data, (d) => {
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
      title: "Tình trạng",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      align: "center",
      width: 130,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tinhTrang,
            value: d.tinhTrang,
          };
        })
      ),
      onFilter: (value, record) => record.tinhTrang.includes(value),
      filterSearch: true,
      render: (value, record) => (
        <div title={record.lyDoTuChoi && `Lý do từ chối: ${record.lyDoTuChoi}`}>
          {value && (
            <Tag
              color={
                value === "Chưa kiểm tra" || value === "Đã kiểm tra, Chưa duyệt"
                  ? "orange"
                  : value === "Đã duyệt"
                  ? "blue"
                  : "red"
              }
              style={{
                whiteSpace: "break-spaces",
                fontSize: 13,
              }}
            >
              {value}
            </Tag>
          )}
        </div>
      ),
    },
  ];

  let columnCBNV = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Mã nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      align: "center",
      width: 100,
    },
    {
      title: "Họ & tên",
      dataIndex: "fullName",
      key: "fullName",
      align: "left",
      width: 180,
    },
    {
      title: "Ngày sinh",
      dataIndex: "ngaySinh",
      key: "ngaySinh",
      width: 100,
      align: "center",
    },
    {
      title: "Chức danh",
      dataIndex: "tenChucDanh",
      key: "tenChucDanh",
      align: "center",
      width: 120,
    },
    {
      title: "Phòng ban",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      align: "left",
      width: 180,
    },
    {
      title: "Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      align: "left",
      width: 200,
    },
  ];

  const handleXacNhan = () => {
    const newData = SelectedLopHoc.map((lophoc) => {
      return lophoc.id;
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_LopHoc/duyet`,
          "PUT",
          newData,
          "XACNHAN",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          setSelectedLopHoc([]);
          setSelectedKeys([]);
          getListData(ChuyenDe, keyword);
        }
      })
      .catch((error) => console.error(error));
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận duyệt lớp học",
    onOk: handleXacNhan,
  };

  const ModalXacNhan = () => {
    Modal(prop);
  };

  const handleTuChoi = (data) => {
    const newData = SelectedLopHoc.map((lophoc) => {
      return lophoc.id;
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_LopHoc/duyet/?lyDoTuChoi=${data}`,
          "PUT",
          newData,
          "TUCHOI",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status !== 409) {
          setSelectedLopHoc([]);
          setSelectedKeys([]);
          getListData(ChuyenDe, keyword);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleOnSelectChuyenDe = (value) => {
    setChuyenDe(value);
    getListData(value, keyword);
  };

  const handleClearChuyenDe = () => {
    setChuyenDe(null);
    getListData(null, keyword);
  };

  const rowSelection = {
    selectedRowKeys: SelectedKeys,
    selectedRows: SelectedLopHoc,
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedLopHoc = [...selectedRows];
      const newSelectedKeys = [...selectedRowKeys];
      setSelectedLopHoc(newSelectedLopHoc);
      setSelectedKeys(newSelectedKeys);
    },
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<CheckCircleOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={ModalXacNhan}
          disabled={SelectedLopHoc.length === 0}
        >
          Duyệt
        </Button>
        <Button
          icon={<CloseCircleOutlined />}
          className="th-margin-bottom-0"
          type="danger"
          onClick={() => setActiveModalTuChoi(true)}
          disabled={SelectedLopHoc.length === 0}
        >
          Từ chối
        </Button>
      </>
    );
  };

  const title = (
    <span>
      CHI TIẾT LỚP HỌC {ChiTietLopHoc && ChiTietLopHoc.maLopHoc.toUpperCase()}
    </span>
  );

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Danh sách lớp học chưa duyệt"
        description="Danh sách lớp học chưa duyệt"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom">
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
            <span>Chuyên đề:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListChuyenDe ? ListChuyenDe : []}
              placeholder="Chọn chuyên đề đào tạo"
              optionsvalue={["id", "tenChuyenDeDaoTao"]}
              style={{ width: "100%" }}
              value={ChuyenDe}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectChuyenDe}
              allowClear
              onClear={handleClearChuyenDe}
            />
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <span>Tìm kiếm:</span>
            <Toolbar
              count={1}
              search={{
                loading,
                value: keyword,
                placeholder: "Tìm kiếm",
                onChange: onChangeKeyword,
                onPressEnter: onSearchCBNV,
                onSearch: onSearchCBNV,
                allowClear: true,
              }}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1650, y: "48vh" }}
          columns={renderHead}
          className="gx-table-responsive th-table"
          dataSource={reDataForTable(Data)}
          size="small"
          pagination={false}
          loading={loading}
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            preserveSelectedRowKeys: true,
            selectedRowKeys: SelectedKeys,
          }}
        />
      </Card>
      <AntModal
        title={title}
        className="th-card-reset-margin"
        open={ActiveModalChiTiet}
        width={width >= 1600 ? `80%` : "100%"}
        closable={true}
        onCancel={() => setActiveModalChiTiet(false)}
        footer={null}
      >
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row gutter={[0, 10]}>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {ChiTietLopHoc && (
                <span>
                  <strong>Tên lớp học:</strong> {ChiTietLopHoc.tenLopHoc}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {ChiTietLopHoc && (
                <span>
                  <strong>Chuyên đề đào tạo:</strong>{" "}
                  {ChiTietLopHoc.tenChuyenDeDaoTao}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {ChiTietLopHoc && (
                <span>
                  <strong>Hình thức đào tạo:</strong>{" "}
                  {ChiTietLopHoc.tenHinhThucDaoTao}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {ChiTietLopHoc && (
                <span>
                  <strong>Thời gian đào tạo:</strong>{" "}
                  {ChiTietLopHoc.thoiGianDaoTao}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {ChiTietLopHoc && (
                <span>
                  <strong>Thời lượng đào tạo:</strong>{" "}
                  {ChiTietLopHoc.thoiLuongDaoTao} phút
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {ChiTietLopHoc && (
                <span>
                  <strong>Người đăng ký:</strong> {ChiTietLopHoc.tenNguoiTao}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {ChiTietLopHoc && (
                <span>
                  <strong> Số lượng học viên:</strong>{" "}
                  {ChiTietLopHoc.list_ChiTiets.length} học viên
                </span>
              )}
            </Col>
            {ChiTietLopHoc && ChiTietLopHoc.diaDiem && (
              <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
                <span>
                  <strong>Địa điểm đào tạo:</strong> {ChiTietLopHoc.diaDiem}
                </span>
              </Col>
            )}
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {ChiTietLopHoc && (
                <span>
                  <strong>Người duyệt:</strong> {ChiTietLopHoc.tenNguoiDuyet}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {ChiTietLopHoc && (
                <span>
                  <strong>Tình trạng:</strong>{" "}
                  <span
                    style={{
                      color:
                        ChiTietLopHoc.tinhTrang === "Đã duyệt"
                          ? "#0469b9"
                          : ChiTietLopHoc.tinhTrang === "Chưa duyệt"
                          ? "orange"
                          : "red",
                    }}
                  >
                    {ChiTietLopHoc.tinhTrang}
                  </span>
                </span>
              )}
            </Col>
          </Row>
        </Card>
        <Card className="th-card-margin-bottom" title={"Danh sách học viên"}>
          <Table
            bordered
            scroll={{ x: 1000, y: "30vh" }}
            columns={columnCBNV}
            className="gx-table-responsive th-table"
            dataSource={reDataForTable(
              ChiTietLopHoc && ChiTietLopHoc.list_ChiTiets
            )}
            size="small"
            pagination={false}
            // loading={loading}
          />
        </Card>
      </AntModal>
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        handleTuChoi={handleTuChoi}
        lophoc={ChiTietLopHoc}
      />
    </div>
  );
}

export default DuyetLopHoc;
