import React, { useEffect, useState } from "react";
import { Card, Divider, Row, Col, DatePicker } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map } from "lodash";
import {
  ModalDeleteConfirm,
  Table,
  EditableTableRow,
  Select,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  getLocalStorage,
  getTokenInfo,
  removeDuplicates,
  getDateNow,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";

const { EditableRow, EditableCell } = EditableTableRow;

function CauHinhKanBan({ match, history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [Data, setData] = useState([]);
  const [ListChuyen, setListChuyen] = useState([]);
  const [Chuyen, setChuyen] = useState(null);
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState(null);
  const [ListDonHang, setListDonHang] = useState([]);
  const [DonHang, setDonHang] = useState(null);
  const [ListTram, setListTram] = useState([]);
  const [Tram, setTram] = useState(null);
  const [Ngay, setNgay] = useState(getDateNow());
  const listchuyen = [
    {
      id: "63aece3b-f542-4c09-bc51-49a39f831906",
      maChuyen: "HLKR",
      tenChuyen: "Chuyền Hàn linh kiện rời",
      tenXuong: "Gia công linh kiện",
    },
  ];
  useEffect(() => {
    if (permission && permission.view) {
      setListChuyen(listchuyen);
      setChuyen(listchuyen[0].id);
      getListSanPham(listchuyen[0].id, Ngay, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (
    tits_qtsx_Chuyen_Id,
    tits_qtsx_SanPham_Id,
    tits_qtsx_DonHang_Id,
    tits_qtsx_Tram_Id,
    ngay,
    page
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Chuyen_Id,
      tits_qtsx_SanPham_Id,
      tits_qtsx_DonHang_Id,
      tits_qtsx_Tram_Id,
      ngay,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KanBan?${param}`,
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

  const getListSanPham = (tits_qtsx_Chuyen_Id, ngay, page) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Chuyen_Id,
      ngay,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KanBan?${param}`,
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
          setListSanPham(res.data);
          setSanPham(res.data[0].tits_qtsx_SanPham_Id);
          getListDonHang(
            tits_qtsx_Chuyen_Id,
            res.data[0].tits_qtsx_SanPham_Id,
            ngay,
            page
          );
        } else {
          setListSanPham([]);
          setSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListDonHang = (
    tits_qtsx_Chuyen_Id,
    tits_qtsx_SanPham_Id,
    ngay,
    page
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Chuyen_Id,
      tits_qtsx_SanPham_Id,
      ngay,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KanBan?${param}`,
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
          setListDonHang(res.data);
          setDonHang(res.data[0].tits_qtsx_DonHang_Id);
          getListTram(
            tits_qtsx_Chuyen_Id,
            tits_qtsx_SanPham_Id,
            res.data[0].tits_qtsx_DonHang_Id,
            ngay,
            page
          );
        } else {
          setListDonHang([]);
          setDonHang([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListTram = (
    tits_qtsx_Chuyen_Id,
    tits_qtsx_SanPham_Id,
    tits_qtsx_DonHang_Id,
    ngay,
    page
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Chuyen_Id,
      tits_qtsx_SanPham_Id,
      tits_qtsx_DonHang_Id,
      ngay,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KanBan?${param}`,
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
          setListTram(res.data);
          setTram(res.data[0].tits_qtsx_Tram_Id);
          getListData(
            tits_qtsx_Chuyen_Id,
            tits_qtsx_SanPham_Id,
            tits_qtsx_DonHang_Id,
            res.data[0].tits_qtsx_Tram_Id,
            ngay,
            page
          );
        } else {
          setListTram([]);
          setTram(null);
        }
      })
      .catch((error) => console.error(error));
  };

  const actionContent = (item) => {
    const editItem =
      permission && permission.edit && item.nguoiTao_Id === INFO.user_Id ? (
        <Link
          to={{
            pathname: `${match.url}/${item.tits_qtsx_HangMucKiemTra_Id}/chinh-sua`,
            state: { itemData: item },
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

    return <div>{editItem}</div>;
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(Chuyen, SanPham, DonHang, Tram, Ngay, pagination);
  };

  const { totalRow, pageSize } = Data;

  let renderHead = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 110,
      render: (value) => actionContent(value),
      fixed: "left",
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã chi tiết",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
      filters: removeDuplicates(
        map(Data.datalist, (d) => {
          return {
            text: d.maSanPham,
            value: d.maSanPham,
          };
        })
      ),
      onFilter: (value, record) => record.maSanPham.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên chi tiết",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
      filters: removeDuplicates(
        map(Data.datalist, (d) => {
          return {
            text: d.tenSanPham,
            value: d.tenSanPham,
          };
        })
      ),
      onFilter: (value, record) => record.tenSanPham.includes(value),
      filterSearch: true,
    },
    {
      title: "Chi tiết cụm",
      dataIndex: "tenCongDoan",
      key: "tenCongDoan",
      align: "center",
      filters: removeDuplicates(
        map(Data.datalist, (d) => {
          return {};
        })
      ),
      onFilter: (value, record) => record.tenCongDoan.includes(value),
      filterSearch: true,
    },
    {
      title: "Số lượng (Chi tiết)",
      dataIndex: "tenHangMucKiemTra",
      key: "tenHangMucKiemTra",
      align: "center",
      width: 100,
    },
    {
      title: "Chuyền hàn Sup",
      align: "center",
      children: [
        {
          title: "Trạm dầm chính",
          dataIndex: "moTa",
          key: "moTa",
          align: "center",
          width: 100,
        },
        {
          title: "Trạm đà đầu",
          dataIndex: "moTa",
          key: "moTa",
          align: "center",
          width: 100,
        },
        {
          title: "Trạm đà sau",
          dataIndex: "moTa",
          key: "moTa",
          align: "center",
          width: 100,
        },
        {
          title: "Trạm cán sau",
          dataIndex: "moTa",
          key: "moTa",
          align: "center",
          width: 100,
        },
        {
          title: "Trạm chân chống",
          dataIndex: "moTa",
          key: "moTa",
          align: "center",
          width: 100,
        },
      ],
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = map(renderHead, (col) => {
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

  const handleOnSelectChuyen = (value) => {
    setChuyen(value);
    setSanPham(null);
    setListSanPham([]);
    getListSanPham(value, Ngay, 1);
    setDonHang(null);
    setListDonHang([]);
    setTram(null);
    setListTram([]);
    getListData(value, null, null, null, Ngay, 1);
  };

  const handleOnSelectSanPham = (value) => {
    setSanPham(value);
    setDonHang(null);
    setListDonHang([]);
    getListDonHang(Chuyen, value, Ngay, 1);
    setTram(null);
    setListTram([]);
    getListData(Chuyen, value, null, null, Ngay, 1);
  };

  const handleOnSelectDonHang = (value) => {
    setDonHang(value);
    setTram(null);
    setListTram([]);
    getListDonHang(Chuyen, SanPham, value, Ngay, 1);
    getListData(Chuyen, SanPham, value, null, Ngay, 1);
  };

  const handleOnSelectTram = (value) => {
    setTram(value);
    getListData(Chuyen, SanPham, DonHang, value, Ngay, 1);
  };

  const handleChangeNgay = (dateString) => {
    setNgay(dateString);
    getListData(Chuyen, SanPham, DonHang, Tram, dateString, 1);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Cấu hình KanBan cho sản phẩm"
        description="Cấu hình KanBan cho sản phẩm"
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={20}
            xs={24}
            style={{
              marginBottom: 8,
            }}
          >
            <h5>Chuyển:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListChuyen ? ListChuyen : []}
              placeholder="Chọn chuyền"
              optionsvalue={["id", "tenChuyen"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectChuyen}
              value={Chuyen}
            />
          </Col>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={20}
            xs={24}
            style={{
              marginBottom: 8,
            }}
          >
            <h5>Sản phẩm:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSanPham ? ListSanPham : []}
              placeholder="Chọn sản phẩm"
              optionsvalue={["tits_qtsx_SanPham_Id", "tenSanPham"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectSanPham}
              value={SanPham}
            />
          </Col>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={20}
            xs={24}
            style={{
              marginBottom: 8,
            }}
          >
            <h5>Đơn hàng:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListDonHang ? ListDonHang : []}
              placeholder="Chọn đơn hàng"
              optionsvalue={["tits_qtsx_DonHang_Id", "tenDonHang"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectDonHang}
              value={DonHang}
            />
          </Col>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={20}
            xs={24}
            style={{
              marginBottom: 8,
            }}
          >
            <h5>Trạm:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListTram ? ListTram : []}
              placeholder="Chọn trạm"
              optionsvalue={["tits_qtsx_Tram_Id", "tenTram"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectTram}
              value={Tram}
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
            <h5>Ngày:</h5>
            <DatePicker
              format={"DD/MM/YYYY"}
              onChange={(date, dateString) => handleChangeNgay(dateString)}
              defaultValue={moment(Ngay, "DD/MM/YYYY")}
              allowClear={false}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1500, y: "55vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(Data.datalist)}
          size="small"
          rowClassName={"editable-row"}
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
    </div>
  );
}

export default CauHinhKanBan;
