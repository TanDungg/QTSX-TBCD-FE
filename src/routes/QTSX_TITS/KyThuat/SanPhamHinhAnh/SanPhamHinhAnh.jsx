import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Divider,
  Col,
  Row,
  Image,
  Modal as AntModal,
  Upload,
} from "antd";
import {
  CopyOutlined,
  SyncOutlined,
  PlusCircleOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";
import ModalThemHinhAnh from "./ModalThemHinhAnh";
import ModalSaoChep from "./ModalSaoChep";
import Helpers from "src/helpers";

function SanPhamHinhAnh({ history, permission }) {
  const dispatch = useDispatch();
  const [Data, setData] = useState([]);
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState(null);
  const [CongDoan, setCongDoan] = useState(null);
  const [ActiveModalSaoChep, setActiveModalSaoChep] = useState(false);
  const [ActiveModalThemHinhAnh, setActiveModalThemHinhAnh] = useState(false);
  const [DisabledModalDoiHinhAnh, setDisabledModalDoiHinhAnh] = useState(false);
  const [FileHinhAnh, setFileHinhAnh] = useState(null);
  const [FileAnh, setFileAnh] = useState(null);
  const [DisableUploadHinhAnh, setDisableUploadHinhAnh] = useState(false);
  const [OpenImage, setOpenImage] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getSanPham();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (tits_qtsx_SanPham_Id) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_SanPham_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SanPhamHinhAnh?${param}`,
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
          setSanPham(res.data[0].id);
          getListData(res.data[0].id);
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

  const props = {
    accept: "image/png, image/jpeg",
    beforeUpload: (file) => {
      const isPNG = file.type === "image/png" || file.type === "image/jpeg";
      if (!isPNG) {
        Helpers.alertError(`${file.name} không phải hình ảnh`);
      } else {
        setFileHinhAnh(file);
        setDisableUploadHinhAnh(true);
        const reader = new FileReader();
        reader.onload = (e) => setFileAnh(e.target.result);
        reader.readAsDataURL(file);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const handleThayDoiHinhAnh = (item) => {
    setDisabledModalDoiHinhAnh(true);
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
        {Data.length !== 0 &&
          Data.map((dt) => {
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
                                          padding: 5,
                                        }}
                                        src={BASE_URL_API + hinhanh.hinhAnh}
                                      />
                                      <Button
                                        title="Đổi hình ảnh"
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
                                          color: "#0469B9",
                                          backgroundColor: "#fff",
                                          borderColor: "#c8c8c8",
                                          borderRadius: 15,
                                          transition:
                                            "background-color 0.3s ease",
                                        }}
                                        onClick={() =>
                                          handleThayDoiHinhAnh({
                                            id: hinhanh.tits_qtsx_SanPhamHinhAnh_Id,
                                            hinhAnh: hinhanh.hinhAnh,
                                            tenKhuVuc: khuvuc.tenKhuVuc,
                                            moTa: khuvuc.moTa,
                                          })
                                        }
                                      >
                                        <SyncOutlined
                                          style={{ fontSize: 15 }}
                                        />
                                      </Button>
                                    </div>
                                  );
                                })}
                            </div>
                            {index !==
                              JSON.parse(dt.list_KhuVucs).length - 1 && (
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
        itemData={SanPham}
      />
      <AntModal
        title={"Thay đổi hình ảnh"}
        className="th-card-reset-margin"
        open={DisabledModalDoiHinhAnh}
        width={`60%`}
        closable={true}
        onCancel={() => setDisabledModalDoiHinhAnh(false)}
        footer={null}
      >
        <Card className="th-card-margin-bottom" align="center">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 15,
              height: 20,
              width: "100%",
            }}
          >
            <span style={{ width: "120px" }}>Hình ảnh:</span>
            {!DisableUploadHinhAnh ? (
              <Upload {...props}>
                <Button
                  style={{
                    marginBottom: 0,
                  }}
                  icon={<UploadOutlined />}
                >
                  Tải file hình ảnh
                </Button>
              </Upload>
            ) : (
              <span>
                <span
                  style={{
                    color: "#0469B9",
                    cursor: "pointer",
                    whiteSpace: "break-spaces",
                  }}
                  onClick={() => setOpenImage(true)}
                >
                  {FileHinhAnh.name}{" "}
                </span>
                <DeleteOutlined
                  style={{ cursor: "pointer", color: "red" }}
                  onClick={() => {
                    setFileHinhAnh(null);
                    setDisableUploadHinhAnh(false);
                  }}
                />
                <Image
                  width={100}
                  src={FileAnh}
                  alt="preview"
                  style={{
                    display: "none",
                  }}
                  preview={{
                    visible: OpenImage,
                    scaleStep: 0.5,
                    src: FileAnh,
                    onVisibleChange: (value) => {
                      setOpenImage(value);
                    },
                  }}
                />
              </span>
            )}
          </div>
          <Divider />
          <Button
            className="th-margin-bottom-0"
            type="primary"
            // onClick={onSearchThongTinXe}
          >
            Thay đổi
          </Button>
        </Card>
      </AntModal>
    </div>
  );
}

export default SanPhamHinhAnh;
