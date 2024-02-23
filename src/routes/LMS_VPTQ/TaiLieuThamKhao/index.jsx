import { Button, Card, Col, Row } from "antd";
import isEmpty from "lodash/isEmpty";
import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { Select, Toolbar } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import { BASE_URL_API } from "src/constants/Config";
import { PlusOutlined } from "@ant-design/icons";

function TaiLieuThamKhao({ match, history, permission }) {
  const dispatch = useDispatch();
  const playerRef = useRef(null);
  const { loading } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [Data, setData] = useState([]);
  const [ListKienThuc, setListKienThuc] = useState([]);
  const [KienThuc, setKienThuc] = useState(null);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (permission && permission.view) {
      getListData(KienThuc, keyword);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
  }, []);

  const getListData = (vptq_lms_KienThuc_Id, keyword) => {
    let param = convertObjectToUrlParams({
      vptq_lms_KienThuc_Id,
      keyword,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen?${param}`,
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
        setListKienThuc(res.data.list_KienThucFilters);
        setData(res.data.list_ChuyenDeDaoTaos);
      } else {
        setListKienThuc([]);
        setData([]);
      }
    });
  };

  const onSearchNguoiDung = () => {
    getListData(KienThuc, keyword);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(KienThuc, val.target.value);
    }
  };

  const handleOnSelectKienThuc = (value) => {
    setKienThuc(value);
    getListData(value, null, keyword);
  };

  const handleClearKienThuc = () => {
    setKienThuc(null);
    getListData(null, null, keyword);
  };

  const handleXemChiTiet = (item) => {
    const newData = Data.map((dt) => {
      if (dt.vptq_lms_ChuyenDeDaoTao_Id === item.vptq_lms_ChuyenDeDaoTao_Id) {
        return {
          ...dt,
          user_Id: INFO.user_Id,
          isClick: true,
        };
      } else {
        return dt;
      }
    });
    setData(newData);
    history.push({
      pathname: `${match.url}/${item.vptq_lms_ChuyenDeDaoTao_Id}/chi-tiet`,
    });
  };

  const handleRedirect = () => {
    history.push(`${match.path}/them-moi`);
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
          Thêm tài liệu
        </Button>
      </>
    );
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Tài liệu tham khảo"}
        description="Danh sách tài liệu tham khảo"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
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
            <span>Tìm kiếm:</span>
            <Toolbar
              count={1}
              search={{
                title: "Tìm kiếm",
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchNguoiDung,
                onSearch: onSearchNguoiDung,
                placeholder: "Nhập từ khóa",
                allowClear: true,
              }}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row style={{ height: "54vh", overflowY: "auto" }}>
          {Data.length !== 0 &&
            Data.map((dt, index) => {
              return (
                <Col
                  xxl={6}
                  xl={8}
                  lg={12}
                  md={12}
                  sm={24}
                  xs={24}
                  key={index}
                  style={{ marginBottom: 8 }}
                >
                  <Card
                    className="th-card-margin-bottom th-card-reset-margin"
                    style={{
                      border: "2px solid #c8c8c8",
                    }}
                  >
                    <Row gutter={[0, 8]}>
                      <Col
                        span={24}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "center",
                          height: "100%",
                        }}
                      >
                        {dt && (
                          <ReactPlayer
                            style={{
                              cursor: "pointer",
                            }}
                            url={
                              dt.fileVideo ? BASE_URL_API + dt.fileVideo : null
                            }
                            controls={false}
                            width="100%"
                            height="200px"
                            config={{
                              file: {
                                attributes: { controlsList: "nodownload" },
                              },
                            }}
                            ref={playerRef}
                            onStart={() => playerRef.current.seekTo(25)}
                            onClick={() => handleXemChiTiet(dt)}
                          />
                        )}
                      </Col>
                      <Col
                        span={24}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                        }}
                      >
                        {dt && (
                          <span
                            style={{
                              fontSize: "18px",
                              fontWeight: "bold",
                              color: "#0469b9",
                              cursor: "pointer",
                              transition: "color 0.3s",
                            }}
                            onClick={() => handleXemChiTiet(dt)}
                            onMouseOver={(e) =>
                              (e.target.style.color = "#ff0000")
                            }
                            onMouseOut={(e) =>
                              (e.target.style.color = "#0469b9")
                            }
                            onMouseDown={(e) =>
                              (e.target.style.color = "#ff0000")
                            }
                            onMouseUp={(e) =>
                              (e.target.style.color = "#0469b9")
                            }
                          >
                            {dt.tenChuyenDeDaoTao}
                          </span>
                        )}
                      </Col>

                      <Col
                        span={24}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                        }}
                      >
                        <span
                          style={{
                            width: "80px",
                          }}
                        >
                          Giảng viên:
                        </span>
                        {dt && (
                          <span
                            style={{
                              width: "calc(100% - 90px)",
                              color: "#0469b9",
                            }}
                          >
                            {dt.tenGiangVien}
                          </span>
                        )}
                      </Col>
                      <Col
                        span={24}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                        }}
                      >
                        <span
                          style={{
                            width: "130px",
                          }}
                        >
                          Thời lượng đào tạo:
                        </span>
                        {dt && (
                          <span
                            style={{
                              width: "calc(100% - 130px)",
                              color: "#0469b9",
                            }}
                          >
                            {dt.thoiLuongDaoTao} phút
                          </span>
                        )}
                      </Col>
                    </Row>
                  </Card>
                </Col>
              );
            })}
        </Row>
      </Card>
    </div>
  );
}

export default TaiLieuThamKhao;
