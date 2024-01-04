import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Modal as AntModal,
  Image,
  Tag,
  Empty,
  DatePicker,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { map, isEmpty } from "lodash";
import {
  Table,
  EditableTableRow,
  Toolbar,
  Select,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  getLocalStorage,
  getTokenInfo,
  removeDuplicates,
  getNamNow,
  getThangNow,
  getDateNow,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";
import Chart from "react-google-charts";
import { Column } from "@ant-design/charts";
import moment from "moment";
const { RangePicker } = DatePicker;

const { EditableRow, EditableCell } = EditableTableRow;

function BaoCaoChiTietSanXuatNgay({ match, history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [Xuong, setXuong] = useState(null);
  const [Chuyen, setChuyen] = useState(null);
  const [Tram, setTram] = useState(null);
  const [Data, setData] = useState([]);
  const [ListXuong, setListXuong] = useState([]);
  const [ListChuyen, setListChuyen] = useState([]);
  const [ListTram, setListTram] = useState([]);
  const [FromDate, setFromDate] = useState(getDateNow(-7));
  const [ToDate, setToDate] = useState(getDateNow());
  useEffect(() => {
    if (permission && permission.view) {
      getXuong();
      getListData(Xuong, Chuyen, Tram, FromDate, ToDate);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (
    tits_qtsx_Xuong_Id,
    tits_qtsx_Chuyen_Id,
    tits_qtsx_Tram_Id,
    tuNgay,
    denNgay
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Xuong_Id,
      tits_qtsx_Chuyen_Id,
      tits_qtsx_Tram_Id,
      tuNgay,
      denNgay,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BaoCao/bao-cao-chi-tiet-san-xuat-ngay?${param}`,
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
  const getXuong = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Xuong?page=-1`,
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
          setListXuong(res.data);
        } else {
          setListXuong([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Xưởng Id
   * Get list chuyền
   * @param {*} chuyen_Id
   */
  const getChuyen = (xuong_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Chuyen?page=-1&&xuong_Id=${xuong_Id}`,
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
          setListChuyen(res.data);
        } else {
          setListChuyen([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Chuyền Id
   * Get list trạm
   * @param {*} chuyen_Id
   */
  const getTram = (chuyen_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Tram?page=-1&&chuyen_Id=${chuyen_Id}`,
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
        } else {
          setListTram([]);
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
      title: "Mã sản phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.maSanPham,
            value: d.maSanPham,
          };
        })
      ),
      onFilter: (value, record) =>
        record.maSanPham && record.maSanPham.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenSanPham,
            value: d.tenSanPham,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenSanPham && record.tenSanPham.includes(value),
      filterSearch: true,
    },
    {
      title: "Xưởng",
      dataIndex: "tenXuong",
      key: "tenXuong",
      align: "center",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenXuong,
            value: d.tenXuong,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenXuong && record.tenXuong.includes(value),
      filterSearch: true,
    },
    {
      title: "Trạm",
      dataIndex: "tenTram",
      key: "tenTram",
      align: "center",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenTram,
            value: d.tenTram,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenTram && record.tenTram.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày hoàn thành",
      dataIndex: "ngayHoanThanh",
      key: "ngayHoanThanh",
      align: "center",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.ngayHoanThanh,
            value: d.ngayHoanThanh,
          };
        })
      ),
      onFilter: (value, record) =>
        record.ngayHoanThanh && record.ngayHoanThanh.includes(value),
      filterSearch: true,
    },
    {
      title: "Thời gian hoàn thành",
      dataIndex: "thoiGianHoanThanh",
      key: "thoiGianHoanThanh",
      align: "center",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.thoiGianHoanThanh,
            value: d.thoiGianHoanThanh,
          };
        })
      ),
      onFilter: (value, record) =>
        record.thoiGianHoanThanh && record.thoiGianHoanThanh.includes(value),
      filterSearch: true,
    },
    {
      title: "Số lô",
      dataIndex: "maSoLo",
      key: "maSoLo",
      align: "center",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.maSoLo,
            value: d.maSoLo,
          };
        })
      ),
      onFilter: (value, record) =>
        record.maSoLo && record.maSoLo.includes(value),
      filterSearch: true,
    },
    {
      title: "Số khung nội bộ",
      dataIndex: "maNoiBo",
      key: "maNoiBo",
      align: "center",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.maNoiBo,
            value: d.maNoiBo,
          };
        })
      ),
      onFilter: (value, record) =>
        record.maNoiBo && record.maNoiBo.includes(value),
      filterSearch: true,
    },
    {
      title: "Số VIN",
      dataIndex: "maSoVin",
      key: "maSoVin",
      align: "center",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.maSoVin,
            value: d.maSoVin,
          };
        })
      ),
      onFilter: (value, record) =>
        record.maSoVin && record.maSoVin.includes(value),
      filterSearch: true,
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

  const handleOnSelectXuong = (value) => {
    if (Xuong !== value) {
      setXuong(value);
      setChuyen(null);
      setTram(null);
      getChuyen(value);
      getListData(value, null, null, FromDate, ToDate);
    }
  };

  const handleClearXuong = () => {
    setXuong(null);
    setChuyen(null);
    setTram(null);
    getListData(null, null, null, FromDate, ToDate);
  };

  const handleOnSelectChuyen = (value) => {
    if (value !== Chuyen) {
      setChuyen(value);
      setTram(null);
      getTram(value);
      getListData(Xuong, value, Tram, FromDate, ToDate);
    }
  };

  const handleClearChuyen = () => {
    setChuyen(null);
    setTram(null);
    getListData(Xuong, null, Tram, FromDate, ToDate);
  };

  const handleOnSelectTram = (value) => {
    if (Tram !== value) {
      setTram(value);
      getListData(Xuong, Chuyen, value, FromDate, ToDate);
    }
  };

  const handleClearTram = () => {
    setTram(null);
    getListData(Xuong, Chuyen, null, FromDate, ToDate);
  };
  const handleChangeNgay = (dateString) => {
    if (FromDate !== dateString[0] && ToDate !== dateString[1]) {
      setFromDate(dateString[0]);
      setToDate(dateString[1]);
      getListData(Xuong, Chuyen, Tram, dateString[0], dateString[1]);
    }
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Báo cáo chi tiết sản xuất ngày"
        description="Báo cáo chi tiết sản xuất ngày"
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
            <h5>Xưởng:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListXuong ? ListXuong : []}
              placeholder="Chọn xưởng"
              optionsvalue={["id", "tenXuong"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectXuong}
              allowClear
              onClear={handleClearXuong}
              value={Xuong}
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
              allowClear
              onClear={handleClearChuyen}
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
            <h5>Trạm:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListTram ? ListTram : []}
              placeholder="Chọn trạm"
              optionsvalue={["id", "tenTram"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectTram}
              allowClear
              onClear={handleClearTram}
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
            <RangePicker
              format={"DD/MM/YYYY"}
              onChange={(date, dateString) => handleChangeNgay(dateString)}
              defaultValue={[
                moment(FromDate, "DD/MM/YYYY"),
                moment(ToDate, "DD/MM/YYYY"),
              ]}
              allowClear={false}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1400, y: "56vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(Data)}
          size="small"
          rowClassName={(record) => {
            "editable-row";
          }}
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default BaoCaoChiTietSanXuatNgay;
