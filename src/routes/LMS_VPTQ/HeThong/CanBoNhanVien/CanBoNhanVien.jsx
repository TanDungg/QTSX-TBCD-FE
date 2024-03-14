import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  ExportOutlined,
  ImportOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import { Table, Toolbar, Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  removeDuplicates,
  exportExcel,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import ImportCanBoNhanVien from "./ImportCanBoNhanVien";

function CanBoNhanVien({ match, history, permission }) {
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [data, setData] = useState([]);
  const [ListDonVi, setListDonVi] = useState([]);
  const [DonVi, setDonVi] = useState(null);
  const [ListPhongBan, setListPhongBan] = useState([]);
  const [PhongBan, setPhongBan] = useState(null);
  const [ListBoPhan, setListBoPhan] = useState([]);
  const [BoPhan, setBoPhan] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [ActiveModalImportCBNV, setActiveModalImportCBNV] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getListDonVi();
      setDonVi(INFO.donVi_Id.toLowerCase());
      getListPhongBan(INFO.donVi_Id.toLowerCase());
      getListData(INFO.donVi_Id.toLowerCase(), PhongBan, BoPhan, keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (donVi_Id, phongBan_Id, boPhan_Id, keyword, page) => {
    let param = convertObjectToUrlParams({
      donVi_Id,
      phongBan_Id,
      boPhan_Id,
      keyword,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ThongTinCBNV?${param}`,
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

  const getListPhongBan = (donVi_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBan/phong-ban-tree?donviid=${donVi_Id}`,
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
          setListPhongBan(res.data);
        } else {
          setListPhongBan([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListBoPhan = (donviid, phongBan_Id) => {
    let param = convertObjectToUrlParams({
      donviid,
      phongBan_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `BoPhan/bo-phan-tree?${param}`,
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
          setListBoPhan(res.data);
        } else {
          setListBoPhan([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleRedirect = () => {
    history.push({
      pathname: `${match.url}/them-moi`,
    });
  };

  const actionContent = (item) => {
    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${item.user_Id}/chinh-sua`,
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

    return <React.Fragment>{editItem}</React.Fragment>;
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(DonVi, PhongBan, BoPhan, keyword, pagination);
  };

  const onSearchCBNV = () => {
    getListData(DonVi, PhongBan, BoPhan, keyword, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(DonVi, PhongBan, BoPhan, val.target.value, page);
    }
  };

  const { totalRow, pageSize } = data;
  const dataList = reDataForTable(data.datalist, page, pageSize);

  let renderHead = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
      fixed: width > 1200 && "left",
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
      fixed: width > 1200 && "left",
    },
    {
      title: "Mã nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      align: "center",
      width: 120,
      fixed: width > 1200 && "left",
      filters: removeDuplicates(
        map(data.datalist, (d) => {
          return {
            text: d.maNhanVien,
            value: d.maNhanVien,
          };
        })
      ),
      onFilter: (value, record) => record.maNhanVien.includes(value),
      filterSearch: true,
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      align: "left",
      width: 150,
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      fixed: width > 1200 && "left",
      filters: removeDuplicates(
        map(data.datalist, (d) => {
          return {
            text: d.fullName,
            value: d.fullName,
          };
        })
      ),
      onFilter: (value, record) => record.fullName.includes(value),
      filterSearch: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "left",
      width: 200,
    },
    {
      title: "SĐT",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 100,
      align: "center",
    },
    {
      title: "Ngày sinh",
      dataIndex: "ngaySinh",
      key: "ngaySinh",
      width: 100,
      align: "center",
      filters: removeDuplicates(
        map(data.datalist, (d) => {
          return {
            text: d.ngaySinh,
            value: d.ngaySinh,
          };
        })
      ),
      onFilter: (value, record) => record.ngaySinh.includes(value),
      filterSearch: true,
    },
    {
      title: "Chức danh",
      dataIndex: "tenChucDanh",
      key: "tenChucDanh",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(data.datalist, (d) => {
          return {
            text: d.tenChucDanh,
            value: d.tenChucDanh,
          };
        })
      ),
      onFilter: (value, record) => record.tenChucDanh.includes(value),
      filterSearch: true,
    },
    {
      title: "Chức vụ",
      dataIndex: "tenChucVu",
      key: "tenChucVu",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(data.datalist, (d) => {
          return {
            text: d.tenChucVu,
            value: d.tenChucVu,
          };
        })
      ),
      onFilter: (value, record) => record.tenChucVu.includes(value),
      filterSearch: true,
    },
    {
      title: "Bộ phận",
      dataIndex: "tenBoPhan",
      key: "tenBoPhan",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(data.datalist, (d) => {
          return {
            text: d.tenBoPhan,
            value: d.tenBoPhan,
          };
        })
      ),
      onFilter: (value, record) => record.tenBoPhan.includes(value),
      filterSearch: true,
    },
    {
      title: "Phòng ban",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(data.datalist, (d) => {
          return {
            text: d.tenPhongBan,
            value: d.tenPhongBan,
          };
        })
      ),
      onFilter: (value, record) => record.tenPhongBan.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      align: "left",
      width: 200,
      filters: removeDuplicates(
        map(data.datalist, (d) => {
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
      title: "Đơn vị trả lương",
      dataIndex: "tenDonViTraLuong",
      key: "tenDonViTraLuong",
      align: "left",
      width: 200,
      filters: removeDuplicates(
        map(data.datalist, (d) => {
          return {
            text: d.tenDonViTraLuong,
            value: d.tenDonViTraLuong,
          };
        })
      ),
      onFilter: (value, record) => record.tenDonViTraLuong.includes(value),
      filterSearch: true,
    },
    {
      title: "Cấp độ nhân sự",
      dataIndex: "capDo",
      key: "capDo",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(data.datalist, (d) => {
          return {
            text: d.capDo,
            value: d.capDo,
          };
        })
      ),
      onFilter: (value, record) => record.capDo.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày vào làm",
      dataIndex: "ngayVaoLam",
      key: "ngayVaoLam",
      align: "center",
      width: 120,
      filters: removeDuplicates(
        map(data.datalist, (d) => {
          return {
            text: d.ngayVaoLam,
            value: d.ngayVaoLam,
          };
        })
      ),
      onFilter: (value, record) => record.ngayVaoLam.includes(value),
      filterSearch: true,
    },
    {
      title: "Chuyên môn",
      dataIndex: "tenChuyenMon",
      key: "tenChuyenMon",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(data.datalist, (d) => {
          return {
            text: d.tenChuyenMon,
            value: d.tenChuyenMon,
          };
        })
      ),
      onFilter: (value, record) => record.tenChuyenMon.includes(value),
      filterSearch: true,
    },
  ];

  const XuatExcel = () => {
    const newData = dataList.map((d) => {
      return {
        ...d,
        hoten: d.fullName,
        sdt: d.phoneNumber,
        chucVu: d.tenChucVu,
        boPhan: d.tenBoPhan,
        phongBan: d.tenPhongBan,
        donVi: d.tenDonVi,
        donViTraLuong: d.tenDonViTraLuong,
      };
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/ExportListExcel_DanhSachCBNV`,
          "POST",
          newData,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        exportExcel("DanhSachCBNV", res.data.dataexcel);
      }
    });
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<PlusOutlined />}
          className="th-margin-bottom-0 btn-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Thêm mới
        </Button>
        <Button
          icon={<ImportOutlined />}
          className="th-margin-bottom-0 btn-margin-bottom-0"
          type="primary"
          onClick={() => setActiveModalImportCBNV(true)}
          disabled={permission && !permission.view}
        >
          Import
        </Button>
        <Button
          icon={<ExportOutlined />}
          className="th-margin-bottom-0 btn-margin-bottom-0"
          type="primary"
          onClick={XuatExcel}
          disabled={(permission && !permission.view) || dataList.length === 0}
        >
          Xuất Excel
        </Button>
      </>
    );
  };

  const handleOnSelectDonVi = (value) => {
    setDonVi(value);
    setPhongBan(null);
    setBoPhan(null);
    getListPhongBan(value);
    setListBoPhan([]);
    getListData(value, null, null, keyword, page);
  };

  const handleOnSelectPhongBan = (value) => {
    setPhongBan(value);
    setBoPhan(null);
    getListBoPhan(DonVi, value);
    getListData(DonVi, value, null, keyword, page);
  };

  const handleClearPhongBan = () => {
    setPhongBan(null);
    setBoPhan(null);
    setListBoPhan([]);
    getListData(DonVi, null, null, keyword, page);
  };

  const handleOnSelectBoPhan = (value) => {
    setBoPhan(value);
    getListData(DonVi, PhongBan, value, keyword, page);
  };

  const handleClearBoPhan = () => {
    setBoPhan(null);
    getListData(DonVi, PhongBan, null, keyword, page);
  };

  const refeshData = () => {
    getListData(DonVi, PhongBan, BoPhan, keyword, page);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Cán bộ nhân viên"
        description="Danh sách cán bộ nhân viên"
        buttons={addButtonRender()}
        classCss="gx-position-button-cbnv"
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
            />
          </Col>
          <Col
            xxl={5}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <span>Phòng ban:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListPhongBan ? ListPhongBan : []}
              placeholder="Chọn phòng ban"
              optionsvalue={["id", "tenPhongBan"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectPhongBan}
              allowClear
              onClear={handleClearPhongBan}
              value={PhongBan}
            />
          </Col>
          <Col
            xxl={5}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <span>Bộ phận:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListBoPhan ? ListBoPhan : []}
              placeholder="Chọn bộ phận"
              optionsvalue={["id", "tenBoPhan"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectBoPhan}
              allowClear
              onClear={handleClearBoPhan}
              value={BoPhan}
            />
          </Col>
          <Col
            xxl={5}
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
          scroll={{ x: 2200, y: "50vh" }}
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
        <ImportCanBoNhanVien
          openModal={ActiveModalImportCBNV}
          openModalFS={setActiveModalImportCBNV}
          refesh={refeshData}
        />
      </Card>
    </div>
  );
}

export default CanBoNhanVien;
