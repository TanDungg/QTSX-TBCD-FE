import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Col, Row, Image } from "antd";
import {
  CopyOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { ModalDeleteConfirm, Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";
import ModalThemHinhAnh from "./ModalThemHinhAnh";
import ModalSaoChep from "./ModalSaoChep";

function SanPhamHinhAnh({ match, history, permission }) {
  const { data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState(null);
  const [CongDoan, setCongDoan] = useState(null);
  const [ActiveModalSaoChep, setActiveModalSaoChep] = useState(false);
  const [ActiveModalThemHinhAnh, setActiveModalThemHinhAnh] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getSanPham();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ActiveModalSaoChep, ActiveModalThemHinhAnh]);

  /**
   * Lấy dữ liệu về
   *
   */
  const getListData = (tits_qtsx_SanPham_Id) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_SanPham_Id,
    });
    dispatch(
      fetchStart(`tits_qtsx_SanPhamHinhAnh?${param}`, "GET", null, "LIST")
    );
  };

  const getSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "tits_qtsx_SanPham?page=-1",
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
          getListData(res.data[0].id);
          setSanPham(res.data[0].id);
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleSaoChep = () => {
    setActiveModalSaoChep(true);
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<CopyOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleSaoChep}
          disabled={permission && !permission.add}
        >
          Sao chép
        </Button>
      </>
    );
  };

  const handleOnSelectSanPham = (value) => {
    setSanPham(value);
    getListData(value);
  };

  const handleRefeshModal = () => {
    getListData(SanPham);
  };

  const handleThemHinhAnh = (data) => {
    setActiveModalThemHinhAnh(true);
    setCongDoan(data.tits_qtsx_CongDoan_Id);
  };

  const ButtonAdd = (dt) => {
    const AddHinhAnh = {
      onClick: () => handleThemHinhAnh(dt),
    };
    return (
      <div>
        <a {...AddHinhAnh} title="Thêm hình ảnh" style={{ fontSize: 20 }}>
          <PlusCircleOutlined />
        </a>
      </div>
    );
  };

  const handleDeleteClick = (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.tenKhuVuc, "hình ảnh của ");
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_SanPhamHinhAnh/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        if (res.status !== 409) {
          getListData(SanPham);
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Hình ảnh sản phẩm"
        description="Danh sách hình ảnh sản phẩm"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom">
        <Row>
          <Col
            xxl={8}
            xl={12}
            lg={16}
            md={16}
            sm={20}
            xs={24}
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ width: "130px" }}>Sản phẩm:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSanPham ? ListSanPham : []}
              placeholder="Chọn sản phẩm"
              optionsvalue={["id", "tenSanPham"]}
              style={{ width: "calc(130% - 130px)" }}
              showSearch
              onSelect={handleOnSelectSanPham}
              optionFilterProp="name"
              value={SanPham}
            />
          </Col>
        </Row>
      </Card>
      <Row>
        {data.map((dt) => {
          return (
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={12}
              sm={20}
              xs={24}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                paddingBottom: 10,
              }}
            >
              <Card
                className="th-card-margin-bottom th-card-reset-margin"
                style={{
                  width: "100%",
                  height: "500px",
                  display: "start",
                  justifyContent: "space-around",
                  overflowY: "relative",
                  alignItems: "center",
                  borderColor: "#0469B9",
                  borderRadius: 15,
                }}
              >
                <ContainerHeader
                  title={dt.tenCongDoan}
                  buttons={ButtonAdd(dt)}
                  style={{ position: "sticky", top: 0, zIndex: 1 }}
                />
                <Divider />
                <div
                  style={{
                    overflowY: "auto",
                    maxHeight: "410px",
                  }}
                >
                  {dt.list_KhuVucs &&
                    JSON.parse(dt.list_KhuVucs).map((khuvuc, index) => {
                      return (
                        <div
                          key={index}
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            marginBottom: 10,
                            maxWidth: "420px",
                            overflowWrap: "break-word",
                          }}
                        >
                          <span style={{ fontWeight: "bold", fontSize: 15 }}>
                            {khuvuc.tenKhuVuc}
                          </span>
                          <br />
                          <span style={{}}>Mô tả: {khuvuc.moTa}</span>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              flexWrap: "wrap",
                              marginTop: "10px",
                            }}
                          >
                            {khuvuc.list_HinhAnhs &&
                              khuvuc.list_HinhAnhs.map((hinhanh) => {
                                return (
                                  <div
                                    style={{
                                      position: "relative",
                                      display: "inline-block",
                                      borderRadius: 15,
                                      marginRight: 10,
                                      marginBottom: 10,
                                    }}
                                  >
                                    <Image
                                      width={110}
                                      height={110}
                                      style={{
                                        borderRadius: 15,
                                        border: "1px solid #c8c8c8",
                                        padding: 10,
                                      }}
                                      src={BASE_URL_API + hinhanh.hinhAnh}
                                    />
                                    <Button
                                      title="Xóa hình ảnh"
                                      style={{
                                        width: 25,
                                        height: 30,
                                        position: "absolute",
                                        top: -5,
                                        right: -5,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "red",
                                        backgroundColor: "#fff",
                                        borderColor: "#c8c8c8",
                                        borderRadius: 15,
                                        transition:
                                          "background-color 0.3s ease",
                                      }}
                                      onClick={() =>
                                        handleDeleteClick({
                                          id: hinhanh.tits_qtsx_SanPhamHinhAnh_Id,
                                          tenKhuVuc: khuvuc.tenKhuVuc,
                                        })
                                      }
                                    >
                                      <DeleteOutlined
                                        style={{ fontSize: 15 }}
                                      />
                                    </Button>
                                  </div>
                                );
                              })}
                          </div>
                          {index !== JSON.parse(dt.list_KhuVucs).length - 1 && (
                            <Divider />
                          )}
                        </div>
                      );
                    })}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
      <ModalThemHinhAnh
        openModal={ActiveModalThemHinhAnh}
        openModalFS={setActiveModalThemHinhAnh}
        itemData={{
          tits_qtsx_SanPham_Id: SanPham,
          tits_qtsx_CongDoan_Id: CongDoan,
        }}
        refesh={handleRefeshModal}
      />
      <ModalSaoChep
        openModal={ActiveModalSaoChep}
        openModalFS={setActiveModalSaoChep}
        refesh={handleRefeshModal}
      />
    </div>
  );
}

export default SanPhamHinhAnh;
