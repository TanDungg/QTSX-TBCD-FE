import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  DatePicker,
  Button,
  Tabs,
  Image,
  Checkbox,
} from "antd";
import { PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { find, map, remove } from "lodash";
import { Table, EditableTableRow, Select } from "src/components/Common";
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
import { BASE_URL_API } from "src/constants/Config";

const { EditableRow, EditableCell } = EditableTableRow;

function MaySanXuat({ match, history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [Data, setData] = useState([]);
  const [ListChuyen, setListChuyen] = useState([]);
  const [Chuyen, setChuyen] = useState(null);
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState(null);
  const [ListDonHang, setListDonHang] = useState([]);
  const [DonHang, setDonHang] = useState(null);
  const [Ngay, setNgay] = useState(getDateNow());
  const [SelectedKanBan, setSelectedKanBan] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);
  const [keyTabs, setKeyTabs] = useState("1");
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
      getListSanPham(listchuyen[0].id, Ngay);
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
    ngay
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Chuyen_Id,
      tits_qtsx_SanPham_Id,
      tits_qtsx_DonHang_Id,
      ngay,
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
          setData(res.data.list_ChiTiets);
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
            ngay
          );
        } else {
          setListSanPham([]);
          setSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListDonHang = (tits_qtsx_Chuyen_Id, tits_qtsx_SanPham_Id, ngay) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Chuyen_Id,
      tits_qtsx_SanPham_Id,
      ngay,
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
          getListData(
            tits_qtsx_Chuyen_Id,
            tits_qtsx_SanPham_Id,
            res.data[0].tits_qtsx_DonHang_Id,
            ngay
          );
        } else {
          setListDonHang([]);
          setDonHang([]);
        }
      })
      .catch((error) => console.error(error));
  };

  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Bắt đầu",
      dataIndex: "isBatDau",
      key: "isBatDau",
      align: "center",
      width: 70,
      render: (value) => {
        return <Checkbox checked={value} disabled={true} />;
      },
    },
    {
      title: "Tên chi tiết",
      dataIndex: "tenChiTiet",
      key: "tenChiTiet",
      align: "center",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenChiTiet,
            value: d.tenChiTiet,
          };
        })
      ),
      onFilter: (value, record) => record.tenChiTiet.includes(value),
      filterSearch: true,
    },
    {
      title: "Vật liệu",
      dataIndex: "vatLieu",
      key: "vatLieu",
      align: "center",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.vatLieu,
            value: d.vatLieu,
          };
        })
      ),
      onFilter: (value, record) => record.vatLieu.includes(value),
      filterSearch: true,
    },
    {
      title: "Số lượng (Chi tiết)",
      dataIndex: "soLuongChiTiet",
      key: "soLuongChiTiet",
      align: "center",
      width: 70,
    },
    {
      title: "Quy cách chi tiết (mm)",
      align: "center",
      children: [
        {
          title: "Dài",
          dataIndex: "dai",
          key: "dai",
          align: "center",
          width: 70,
        },
        ,
        {
          title: "Rộng",
          dataIndex: "rong",
          key: "rong",
          align: "center",
          width: 70,
        },
        ,
        {
          title: "Dày",
          dataIndex: "day",
          key: "day",
          align: "center",
          width: 70,
        },
        ,
        {
          title: "Do",
          dataIndex: "do",
          key: "do",
          align: "center",
          width: 70,
        },
        {
          title: "Di",
          dataIndex: "di",
          key: "di",
          align: "center",
          width: 70,
        },
      ],
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "thoiGianBatDau",
      key: "thoiGianBatDau",
      align: "center",
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "thoiGianKetThuc",
      key: "thoiGianKetThuc",
      align: "center",
    },
    {
      title: "Tổng TGGC (Phút)",
      dataIndex: "tongTGGC",
      key: "tongTGGC",
      align: "center",
      width: 70,
    },
    {
      title: "SL chưa sản xuất",
      dataIndex: "soLuongChuaSanXuat",
      key: "soLuongChuaSanXuat",
      align: "center",
      width: 70,
    },
    {
      title: "SL đã sản xuất",
      dataIndex: "soLuongDaSanXuat",
      key: "soLuongDaSanXuat",
      align: "center",
      width: 70,
    },
    {
      title: "Tình trạng",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      align: "center",
    },
    {
      title: "Bản vẽ",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      render: (value) =>
        value && (
          <span>
            <Image
              src={BASE_URL_API + value}
              alt="Hình ảnh bản vẽ"
              style={{ maxWidth: 70, maxHeight: 70 }}
            />
          </span>
        ),
    },
    {
      title: "SL lỗi khi KTCL",
      dataIndex: "soLuongLoi",
      key: "soLuongLoi",
      align: "center",
      width: 70,
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

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<PlayCircleOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          // onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Bắt đầu
        </Button>
        <Button
          icon={<PauseCircleOutlined />}
          className="th-margin-bottom-0"
          type="danger"
          // onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Kết thúc
        </Button>
      </>
    );
  };

  const handleOnSelectChuyen = (value) => {
    setChuyen(value);
    setSanPham(null);
    setListSanPham([]);
    getListSanPham(value, Ngay);
    setDonHang(null);
    setListDonHang([]);
  };

  const handleOnSelectSanPham = (value) => {
    setSanPham(value);
    setDonHang(null);
    setListDonHang([]);
    getListDonHang(Chuyen, value, Ngay);
  };

  const handleOnSelectDonHang = (value) => {
    setDonHang(value);
    getListData(Chuyen, SanPham, value, Ngay);
  };

  const handleChangeNgay = (dateString) => {
    setNgay(dateString);
    getListData(Chuyen, SanPham, DonHang, dateString);
  };

  const handleChangeTabs = (key) => {
    // key === "1" ? "" : "";
  };

  const rowSelection = {
    selectedRowKeys: SelectedKeys,
    selectedRowKanBans: SelectedKanBan,
    onChange: (selectedRowKeys, selectedRowKanBans) => {
      const newSelectedKanBan = [...selectedRowKanBans];
      const newSelectedKey = [...selectedRowKeys];
      setSelectedKanBan(newSelectedKanBan);
      setSelectedKeys(newSelectedKey);
    },
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Máy sản xuất"
        description="Máy sản xuất"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Tabs
          defaultActiveKey="1"
          type="card"
          onChange={() => handleChangeTabs()}
          size={"middle"}
          items={new Array(2).fill(null).map((_, i) => {
            const id = String(i + 1);
            // setKeyTabs(id);
            return {
              label: id === "1" ? `Sản xuất` : `Kiểm tra chất lượng`,
              key: id,
              children:
                id === "1" ? (
                  <>
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
                          <h5>Chuyền:</h5>
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
                            optionsvalue={[
                              "tits_qtsx_SanPham_Id",
                              "tenSanPham",
                            ]}
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
                            optionsvalue={[
                              "tits_qtsx_DonHang_Id",
                              "tenDonHang",
                            ]}
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
                          sm={24}
                          xs={24}
                          style={{ marginBottom: 8 }}
                        >
                          <h5>Ngày:</h5>
                          <DatePicker
                            format={"DD/MM/YYYY"}
                            onChange={(date, dateString) =>
                              handleChangeNgay(dateString)
                            }
                            defaultValue={moment(Ngay, "DD/MM/YYYY")}
                            allowClear={false}
                          />
                        </Col>
                      </Row>
                    </Card>
                    <Table
                      bordered
                      scroll={{ x: 1400, y: "55vh" }}
                      columns={columns}
                      components={components}
                      className="gx-table-responsive"
                      dataSource={reDataForTable(Data)}
                      size="small"
                      rowClassName={"editable-row"}
                      pagination={false}
                      loading={loading}
                      rowSelection={{
                        type: "checkbox",
                        ...rowSelection,
                        preserveSelectedRowKeys: true,
                        selectedRowKeys: SelectedKeys,
                        getCheckboxProps: (record) => ({}),
                      }}
                    />
                  </>
                ) : (
                  <>
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
                          <h5>Chuyền:</h5>
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
                            optionsvalue={[
                              "tits_qtsx_SanPham_Id",
                              "tenSanPham",
                            ]}
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
                            optionsvalue={[
                              "tits_qtsx_DonHang_Id",
                              "tenDonHang",
                            ]}
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
                          sm={24}
                          xs={24}
                          style={{ marginBottom: 8 }}
                        >
                          <h5>Ngày:</h5>
                          <DatePicker
                            format={"DD/MM/YYYY"}
                            onChange={(date, dateString) =>
                              handleChangeNgay(dateString)
                            }
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
                        dataSource={reDataForTable(Data)}
                        size="small"
                        rowClassName={"editable-row"}
                        pagination={false}
                        loading={loading}
                        rowSelection={{
                          type: "checkbox",
                          ...rowSelection,
                          preserveSelectedRowKeys: true,
                          selectedRowKeys: SelectedKeys,
                          getCheckboxProps: (record) => ({}),
                        }}
                      />
                    </Card>
                  </>
                ),
            };
          })}
        />
      </Card>
    </div>
  );
}

export default MaySanXuat;
