import { Button, Card, Col, Divider, Pagination, Row } from "antd";
import isEmpty from "lodash/isEmpty";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { ModalDeleteConfirm, Select, Toolbar } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  convertObjectToUrlParams,
  getTokenInfo,
  getLocalStorage,
  LayDuoiFile,
} from "src/util/Common";
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { BASE_URL_API } from "src/constants/Config";

function TaiLieuThamKhao({ match, history, permission }) {
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [Data, setData] = useState([]);
  const [totalRow, setTotalRow] = useState(null);
  const [pageSize, setPageSize] = useState(null);
  const [ListKienThuc, setListKienThuc] = useState([]);
  const [KienThuc, setKienThuc] = useState(null);
  const [IsQuanLyTaiLieu, setIsQuanLyTaiLieu] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (permission && permission.view) {
      getIsQuanLyTaiLieu();
      getListKienThuc();
      getListData(KienThuc, keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
  }, []);

  const getIsQuanLyTaiLieu = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_TaiLieuThamKhao/is-ql-tai-lieu-tham-khao?donVi_Id=${INFO.donVi_Id}`,
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
        setIsQuanLyTaiLieu(res.data);
      } else {
        setIsQuanLyTaiLieu(false);
      }
    });
  };

  const getListData = (vptq_lms_KienThuc_Id, keyword, page) => {
    let param = convertObjectToUrlParams({
      vptq_lms_KienThuc_Id,
      keyword,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_TaiLieuThamKhao?${param}`,
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
        setData(res.data.datalist);
        setTotalRow(res.data.totalRow);
        setPageSize(res.data.pageSize);
      } else {
        setData([]);
        setTotalRow(null);
        setPageSize(null);
      }
    });
  };

  const getListKienThuc = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_KienThuc?page=-1`,
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
        setListKienThuc(res.data);
      } else {
        setListKienThuc([]);
      }
    });
  };

  const itemRender = (_, type, originalElement) => {
    if (type === "prev") {
      return <DoubleLeftOutlined />;
    }
    if (type === "next") {
      return <DoubleRightOutlined />;
    }
    return originalElement;
  };

  const handleChangePage = (pagination) => {
    setPage(pagination);
    getListData(KienThuc, keyword, pagination);
  };

  const onSearchNguoiDung = () => {
    getListData(KienThuc, keyword, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(KienThuc, val.target.value, page);
    }
  };

  const handleOnSelectKienThuc = (value) => {
    setKienThuc(value);
    getListData(value, keyword, page);
  };

  const handleClearKienThuc = () => {
    setKienThuc(null);
    getListData(null, keyword, page);
  };

  const handleXemChiTiet = (item) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_TaiLieuThamKhao/${item.id}`,
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
        handleOpenFile(res.data.fileTaiLieu);
        getListData(KienThuc, keyword, page);
      }
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

  const handleOpenFile = (file) => {
    if (file) {
      window.open(BASE_URL_API + file);
    }
  };

  const handleEdit = (item) => {
    history.push(`${match.path}/${item.id}/chinh-sua`);
  };

  const handleDelete = async (item) => {
    ModalDeleteConfirm(
      deleteItemAction,
      item,
      item.tenTaiLieu,
      "file tài liệu tham khảo"
    );
  };

  const deleteItemAction = (item) => {
    let url = `vptq_lms_TaiLieuThamKhao/${item.id}?donVi_Id=${INFO.donVi_Id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        getListData(KienThuc, keyword, page);
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Tài liệu tham khảo"}
        description="Danh sách tài liệu tham khảo"
        buttons={IsQuanLyTaiLieu && addButtonRender()}
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
              optionsvalue={["id", "tenKienThuc"]}
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
        <Row
          style={{
            height: "53vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "row",
            alignContent: "flex-start",
          }}
        >
          {Data.length !== 0 &&
            Data.map((dt, index) => {
              const maxlength = width >= 1200 || width < 768 ? 150 : 120;
              const duoifile = LayDuoiFile(dt.fileTaiLieu);
              let hinhAnh;
              if (duoifile.includes("ppt")) {
                hinhAnh = require("public/images/icon_file_powerpoint.png");
              } else if (duoifile.includes("doc")) {
                hinhAnh = require("public/images/icon_file_word.png");
              } else if (duoifile.includes("pdf")) {
                hinhAnh = require("public/images/icon_file_pdf.png");
              }
              return (
                dt && (
                  <Col
                    xxl={8}
                    xl={12}
                    lg={12}
                    md={12}
                    sm={24}
                    xs={24}
                    key={index}
                    style={{ marginBottom: "15px" }}
                  >
                    <div
                      style={{
                        border: "2px solid #c8c8c8",
                        borderRadius: "10px",
                        padding: "10px 15px",
                        height: "140px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: "3px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                        }}
                      >
                        <img
                          src={hinhAnh}
                          alt="icon file"
                          style={{ width: "60px" }}
                        />
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                            gap: "2px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "16px",
                              fontWeight: "bold",
                              color: "#0469b9",
                              cursor: "pointer",
                              transition: "color 0.3s",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
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
                            title={dt.tenTaiLieu && dt.tenTaiLieu}
                          >
                            {dt.tenTaiLieu && dt.tenTaiLieu.length > 37
                              ? `${dt.tenTaiLieu
                                  .toUpperCase()
                                  .substring(0, 37)}...`
                              : dt.tenTaiLieu.toUpperCase()}
                          </span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              fontSize: "13px",
                            }}
                          >
                            <EyeOutlined />
                            <span>{dt.soLuotXem} lượt xem</span>
                          </div>
                          {IsQuanLyTaiLieu && (
                            <div
                              style={{
                                display: "flex",
                              }}
                            >
                              <div className="button-container">
                                <span
                                  className={`span-click liked`}
                                  title="Chỉnh sửa câu hỏi"
                                  onClick={() => handleEdit(dt)}
                                >
                                  Chỉnh sửa
                                </span>
                              </div>
                              <Divider type="vertical" />
                              <div className="button-container">
                                <span
                                  className={`span-click disliked`}
                                  title="Xóa câu hỏi"
                                  onClick={() => handleDelete(dt)}
                                >
                                  Xóa
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <span
                        style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                        title={dt.moTa && dt.moTa}
                      >
                        {dt.moTa && dt.moTa.length > maxlength
                          ? `${dt.moTa.substring(0, maxlength)}...`
                          : dt.moTa}
                      </span>
                    </div>
                  </Col>
                )
              );
            })}
        </Row>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingTop: "10px",
            borderTop: "1px solid #e8e8e8",
          }}
        >
          <Pagination
            total={totalRow}
            current={page}
            pageSize={pageSize}
            itemRender={itemRender}
            showSizeChanger={false}
            onChange={(page) => handleChangePage(page)}
          />
        </div>
      </Card>
    </div>
  );
}

export default TaiLieuThamKhao;
