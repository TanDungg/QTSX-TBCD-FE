import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Divider,
  Col,
  Row,
  Checkbox,
  Tag,
  Input,
  Empty,
  List,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  RedoOutlined,
  ReloadOutlined,
  SelectOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Select, Toolbar } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  removeDuplicates,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";

const optionsDate = {
  weekday: "long", // Thứ
  year: "numeric", // Năm
  month: "numeric", // Tháng
  day: "numeric", // Ngày
};

const optionsTime = {
  hour: "numeric", // Giờ
  minute: "numeric", // Phút
  second: "numeric", // Giây
  hour12: false, // 24 giờ
};
function TienDoSanXuat({ match, history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  //   const INFO = {
  //     ...getLocalStorage("menu"),
  //     user_Id: getTokenInfo().id,
  //     token: getTokenInfo().token,
  //   };
  const [ListXuong, setListXuong] = useState([]);
  const [ListChuyen, setListChuyen] = useState([]);
  const [ListTram, setListTram] = useState([]);
  const [Xuong, setXuong] = useState(null);
  const [Chuyen, setChuyen] = useState(null);
  const [Tram, setTram] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [ListSoKhungNoiBo, setListSoKhungNoiBo] = useState([]);
  const [DisableVaoTram, setDisableVaoTram] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);
  const formattedDateTime = new Intl.DateTimeFormat(
    "vi-VN",
    optionsDate
  ).format(currentDateTime);
  const formattedTime = new Intl.DateTimeFormat("vi-VN", optionsTime).format(
    currentDateTime
  );
  useEffect(() => {
    if (permission && permission.view) {
      getXuong();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Lấy dữ liệu về
   *
   */
  const getListData = (keyword, tits_qtsx_Xuong_Id, page) => {
    const param = convertObjectToUrlParams({
      keyword,
      tits_qtsx_Xuong_Id,
      page,
    });
    dispatch(
      fetchStart(`tits_qtsx_QuyTrinhSanXuat?${param}`, "GET", null, "LIST")
    );
  };

  const getXuong = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "tits_qtsx_Xuong?page=-1",
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

  const handleOnSelectXuong = (value) => {
    setXuong(value);
    getChuyen(value);
    // getListData(keyword, value, 1);
  };
  const handleOnSelectChuyen = (value) => {
    setChuyen(value);
    getTram(value);
    // getListData(keyword, value, 1);
  };
  const handleOnSelectTram = (value) => {
    setTram(value);
    // getTram(value);
    // getListData(keyword, value, 1);
  };
  const handleClearXuong = (value) => {
    setXuong(null);
    setChuyen(null);
    setTram(null);
    // getListData(keyword, null, 1);
  };
  const handleClearChuyen = (value) => {
    setChuyen(null);
    setTram(null);
    // getListData(keyword, null, 1);
  };
  const handleClearTram = (value) => {
    setTram(null);
    // getListData(keyword, null, 1);
  };
  const data = [
    "QOEC0001",
    "QOEC0002",
    "QOEC0003",
    "QOEC0004",
    "QOEC0005",
    "QOEC0006",
    "QOEC0007",
    "QOEC0008",
    "QOEC0009",
    "QOEC0010",
    "QOEC0011",
    "QOEC0012",
    "QOEC0013",
    "QOEC0014",
    "QOEC0015",
    "QOEC0016",
    "QOEC0017",
    "QOEC0018",
    "QOEC0019",
    "QOEC0020",
  ];
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Nhập tiến độ sản xuất"
        description="Nhập tiến độ sản xuất"
      />
      <Card className="th-card-margin-bottom">
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
            <h5>Xưởng:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListXuong ? ListXuong : []}
              placeholder="Chọn xưởng"
              optionsvalue={["id", "tenXuong"]}
              style={{ width: "100%" }}
              showSearch
              onSelect={handleOnSelectXuong}
              optionFilterProp="name"
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
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Chuyền:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListChuyen ? ListChuyen : []}
              placeholder="Chọn chuyền"
              optionsvalue={["id", "tenChuyen"]}
              style={{ width: "100%" }}
              showSearch
              onSelect={handleOnSelectChuyen}
              optionFilterProp="name"
              allowClear
              onClear={handleClearChuyen}
              value={Chuyen}
              disabled={!Xuong}
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
            <h5>Trạm:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListTram ? ListTram : []}
              placeholder="Chọn trạm"
              optionsvalue={["id", "tenTram"]}
              style={{ width: "100%" }}
              showSearch
              onSelect={handleOnSelectTram}
              optionFilterProp="name"
              allowClear
              onClear={handleClearTram}
              value={Tram}
              disabled={!Chuyen}
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
            align="center"
          >
            <br />
            <br />
            <a style={{ cursor: "none" }}>
              {formattedDateTime},{"  "} {formattedTime}
            </a>
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
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
            <Card
              className="th-card-margin-bottom th-card-reset-margin"
              style={{ minHeight: 174.188 }}
            >
              <h5 style={{ fontWeight: "bold", color: "#0469b9" }}>
                Xe chuẩn bị vào trạm:&nbsp;&nbsp;&nbsp;
                <a disabled={!Tram}>
                  <ReloadOutlined />
                </a>
              </h5>
              <Toolbar
                count={1}
                search={{
                  title: "Tìm kiếm",
                  loading,
                  // value: keyword,
                  // onChange: onChangeKeyword,
                  // onPressEnter: onSearchQuyTrinhSanXuat,
                  // onSearch: onSearchQuyTrinhSanXuat,
                  placeholder: "Nhập từ khóa",
                  allowClear: true,
                  disabled: !Tram,
                }}
              />
              <List
                size="small"
                style={{ marginTop: 5, height: 200, overflow: "auto" }}
                bordered
                dataSource={data}
                renderItem={(item) => (
                  <List.Item>
                    <a>{item}</a>
                  </List.Item>
                )}
              />
            </Card>
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
            <Card className="th-card-margin-bottom th-card-reset-margin">
              <Empty />
            </Card>
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
            align="center"
          >
            <Card
              className="th-card-margin-bottom th-card-reset-margin"
              style={{ minHeight: 174.188 }}
            >
              <Button
                icon={<SelectOutlined />}
                type="primary"
                style={{ width: "80%" }}
                disabled={DisableVaoTram}
              >
                Vào trạm
              </Button>
            </Card>
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col xxl={16} xl={16} lg={12} md={12} sm={24} xs={24}>
            <Input disabled={DisableVaoTram} placeholder="Ghi chú"></Input>
          </Col>
          <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
            <Button
              disabled={DisableVaoTram}
              icon={<SendOutlined />}
              type="primary"
            >
              Gửi
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default TienDoSanXuat;
