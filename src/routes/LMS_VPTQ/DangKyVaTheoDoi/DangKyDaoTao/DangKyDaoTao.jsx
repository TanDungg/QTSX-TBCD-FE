import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Divider,
  Row,
  Modal as AntModal,
  Col,
  Tag,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import {
  ModalDeleteConfirm,
  Table,
  Toolbar,
  Select,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  removeDuplicates,
  getNgayDauThang,
  getNgayCuoiThang,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";

const { RangePicker } = DatePicker;

function DangKyDaoTao({ match, history, permission }) {
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const [data, setData] = useState([]);
  const [ListDonVi, setListDonVi] = useState([]);
  const [DonVi, setDonVi] = useState(null);
  const [TuNgay, setTuNgay] = useState(getNgayDauThang());
  const [DenNgay, setDenNgay] = useState(getNgayCuoiThang());
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [PhieuDangKy, setPhieuDangKy] = useState(null);
  const [ActiveModalChiTiet, setActiveModalChiTiet] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getListDonVi();
      getListData(DonVi, TuNgay, DenNgay, keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (donVi_Id, tuNgay, denNgay, keyword, page) => {
    let param = convertObjectToUrlParams({
      donVi_Id,
      keyword,
      tuNgay,
      denNgay,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_PhieuDangKyDaoTao?${param}`,
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

  const getChiTiet = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_PhieuDangKyDaoTao/${id}`,
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
          setPhieuDangKy(chitiet);
        }
        setActiveModalChiTiet(true);
      })
      .catch((error) => console.error(error));
  };

  const actionContent = (item) => {
    const detailItem =
      permission && permission.del && !item.isUsed
        ? { onClick: () => getChiTiet(item.id) }
        : { disabled: true };

    const editItem =
      item.isKiemTra === false && item.isDuyet === false && !item.lyDoTuChoi ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua`,
            state: { itemData: item, permission },
          }}
          title="Sửa"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa">
          <EditOutlined />
        </span>
      );

    const deleteItemVal =
      item.isKiemTra === false && item.isDuyet === false && !item.lyDoTuChoi
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };

    return (
      <React.Fragment>
        <a {...detailItem} title="Xem chi tiết">
          <SearchOutlined />
        </a>
        <Divider type="vertical" />
        {editItem}
        <Divider type="vertical" />
        <a {...deleteItemVal} title="Xóa">
          <DeleteOutlined />
        </a>
      </React.Fragment>
    );
  };

  const deleteItemFunc = async (item) => {
    ModalDeleteConfirm(
      deleteItemAction,
      item,
      item.maPhieuDangKyDaoTao,
      "phiếu đăng ký đào tạo"
    );
  };

  const deleteItemAction = (item) => {
    let url = `vptq_lms_PhieuDangKyDaoTao/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        getListData(DonVi, TuNgay, DenNgay, keyword, page);
      })
      .catch((error) => console.error(error));
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(DonVi, TuNgay, DenNgay, keyword, pagination);
  };

  const onSearchCBNV = () => {
    getListData(DonVi, TuNgay, DenNgay, keyword, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(DonVi, TuNgay, DenNgay, val.target.value, page);
    }
  };

  const { totalRow, pageSize } = data;
  const dataList = reDataForTable(data.datalist, page, pageSize);

  let renderHead = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 100,
      render: (value) => actionContent(value),
      fixed: "left",
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
      fixed: width > 1600 && "left",
    },
    {
      title: "Mã phiếu",
      dataIndex: "maPhieuDangKyDaoTao",
      key: "maPhieuDangKyDaoTao",
      align: "center",
      width: 130,
      fixed: width > 1600 && "left",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maPhieuDangKyDaoTao,
            value: d.maPhieuDangKyDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.maPhieuDangKyDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên phiếu",
      dataIndex: "tenPhieuDangKyDaoTao",
      key: "tenPhieuDangKyDaoTao",
      align: "left",
      width: 150,
      fixed: width > 1600 && "left",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenPhieuDangKyDaoTao,
            value: d.tenPhieuDangKyDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenPhieuDangKyDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Chuyên đề đào tạo",
      dataIndex: "tenChuyenDeDaoTao",
      key: "tenChuyenDeDaoTao",
      align: "left",
      width: 180,
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
          dự kiến đào tạo
        </div>
      ),
      dataIndex: "thoiGianDuKien",
      key: "thoiGianDuKien",
      align: "center",
      width: 120,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.thoiGianDuKien,
            value: d.thoiGianDuKien,
          };
        })
      ),
      onFilter: (value, record) => record.thoiGianDuKien.includes(value),
      filterSearch: true,
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
      align: "center",
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
      title: "Mục tiêu đào tạo",
      dataIndex: "tenMucTieuDaoTao",
      key: "tenMucTieuDaoTao",
      align: "left",
      width: 200,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenMucTieuDaoTao,
            value: d.tenMucTieuDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenMucTieuDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      align: "left",
      width: 250,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenDonVi,
            value: d.tenDonVi,
          };
        })
      ),
      onFilter: (value, record) => record.tenDonVi.includes(value),
      filterSearch: true,
    },
    {
      title: "Số lượng",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
      width: 90,
      filters: removeDuplicates(
        map(dataList, (d) => {
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
      title: "Tình trạng",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      align: "center",
      width: 130,
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

  const handleRedirect = () => {
    history.push({
      pathname: `${match.url}/them-moi`,
    });
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<PlusOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Thêm mới
        </Button>
      </>
    );
  };

  const handleOnSelectDonVi = (value) => {
    setDonVi(value);
    getListData(value, TuNgay, DenNgay, keyword, page);
  };

  const handleClearDonVi = () => {
    setDonVi(null);
    getListData(null, TuNgay, DenNgay, keyword, page);
  };

  const handleChangeNgay = (dateString) => {
    setTuNgay(dateString[0]);
    setDenNgay(dateString[1]);
    getListData(DonVi, dateString[0], dateString[1], keyword, page);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Đăng ký đào tạo"
        description="Danh sách đăng ký đào tạo"
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
            <span>Đơn vị:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListDonVi ? ListDonVi : []}
              placeholder="Chọn đơn vị"
              optionsvalue={["id", "tenDonVi"]}
              style={{ width: "100%" }}
              value={DonVi}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectDonVi}
              allowClear
              onClear={handleClearDonVi}
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
            <span>Ngày dự kiến đào tạo:</span>
            <RangePicker
              format={"DD/MM/YYYY"}
              onChange={(date, dateString) => handleChangeNgay(dateString)}
              defaultValue={[
                moment(TuNgay, "DD/MM/YYYY"),
                moment(DenNgay, "DD/MM/YYYY"),
              ]}
              allowClear={false}
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
          scroll={{ x: 1650, y: "49vh" }}
          columns={renderHead}
          className="gx-table-responsive th-table"
          dataSource={dataList}
          size="small"
          pagination={{
            onChange: handleTableChange,
            pageSize: pageSize,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
        />
      </Card>
      <AntModal
        title={`CHI TIẾT PHIẾU ĐĂNG KÝ ĐÀO TẠO ${
          PhieuDangKy && PhieuDangKy.maPhieuDangKyDaoTao
        }`}
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
              {PhieuDangKy && (
                <span>
                  <strong>Tên phiếu đăng ký:</strong>{" "}
                  {PhieuDangKy.tenPhieuDangKyDaoTao}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {PhieuDangKy && (
                <span>
                  <strong>Chuyên đề đào tạo:</strong>{" "}
                  {PhieuDangKy.tenChuyenDeDaoTao}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {PhieuDangKy && (
                <span>
                  <strong>Thời gian dự kiến:</strong>{" "}
                  {PhieuDangKy.thoiGianDuKien}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {PhieuDangKy && (
                <span>
                  <strong>Đơn vị:</strong> {PhieuDangKy.tenDonVi}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {PhieuDangKy && (
                <span>
                  <strong>Mục tiêu đào tạo:</strong>{" "}
                  {PhieuDangKy.tenMucTieuDaoTao}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {PhieuDangKy && (
                <span>
                  <strong>Người tạo phiếu:</strong> {PhieuDangKy.tenNguoiTao}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {PhieuDangKy && (
                <span>
                  <strong>Người kiểm tra:</strong> {PhieuDangKy.tenNguoiKiemTra}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {PhieuDangKy && (
                <span>
                  <strong>Người duyệt:</strong> {PhieuDangKy.tenNguoiDuyet}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {PhieuDangKy && (
                <span>
                  <strong>Ghi chú:</strong> {PhieuDangKy.moTa}
                </span>
              )}
            </Col>
          </Row>
        </Card>
        <Card
          className="th-card-margin-bottom"
          title={"Danh sách CBNV đăng ký đào tạo"}
        >
          <Table
            bordered
            scroll={{ x: 1000, y: "35vh" }}
            columns={columnCBNV}
            className="gx-table-responsive th-table"
            dataSource={reDataForTable(
              PhieuDangKy && PhieuDangKy.list_ChiTiets
            )}
            size="small"
            pagination={false}
            // loading={loading}
          />
        </Card>
      </AntModal>
    </div>
  );
}

export default DangKyDaoTao;
