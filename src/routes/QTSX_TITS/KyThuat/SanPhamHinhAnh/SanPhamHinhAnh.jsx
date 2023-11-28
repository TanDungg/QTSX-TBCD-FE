import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Col, Row, Image } from "antd";
import {
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map } from "lodash";
import {
  ModalDeleteConfirm,
  EditableTableRow,
  Select,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import Helpers from "src/helpers";
import ModalThemHinhAnh from "./ModalThemHinhAnh";

const { EditableRow, EditableCell } = EditableTableRow;

function SanPhamHinhAnh({ match, history, permission }) {
  const { width, loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState(null);
  const [ActiveModalThemHinhAnh, setActiveModalThemHinhAnh] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getSanPham();
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

  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua`,
            state: { itemData: item },
          }}
          title="Sửa quy trình công nghệ"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa quy trình công nghệ">
          <EditOutlined />
        </span>
      );
    const deleteVal =
      permission && permission.del && !item.isUsed
        ? { onClick: () => deleteItemFunc(item, "quy trình công nghệ") }
        : { disabled: true };
    return (
      <div>
        {editItem}
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa quy trình công nghệ">
          <DeleteOutlined />
        </a>
      </div>
    );
  };

  /**
   * deleteItemFunc: Xoá item theo item
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item, title) => {
    ModalDeleteConfirm(deleteItemAction, item, item.maQuyTrinhCongNghe, title);
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
        // Reload lại danh sách
        if (res.status !== 409) {
          getListData(SanPham);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Chuyển tới trang thêm mới chức năng
   *
   * @memberof ChucNang
   */
  const handleRedirect = () => {
    history.push({
      pathname: `${match.url}/them-moi`,
    });
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<CopyOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
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

  const ButtonAdd = () => {
    const deleteVal = {
      onClick: () => setActiveModalThemHinhAnh(true),
    };
    return (
      <div>
        <a {...deleteVal} title="Thêm hình ảnh" style={{ fontSize: 20 }}>
          <PlusCircleOutlined />
        </a>
      </div>
    );
  };

  const handleDeleteClick = () => {
    Helpers.alertSuccessMessage("Xóa thành công!");
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
      <Row span={24}>
        {/* {dataList.map((data) => {
              return ( */}
        <Col
          xxl={8}
          xl={8}
          lg={12}
          md={12}
          sm={20}
          xs={24}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <Card
            className="th-card-margin-bottom th-card-reset-margin"
            style={{
              width: "500px",
              height: "500px",
              display: "start",
              justifyContent: "space-around",
              alignItems: "center",
              borderRadius: 15,
              overflowY: "relative",
            }}
          >
            <ContainerHeader
              title="GCCT"
              buttons={ButtonAdd()}
              style={{ position: "sticky", top: 0, zIndex: 1 }}
            />
            <div style={{ overflowY: "auto", maxHeight: "410px" }}>
              <div
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  marginBottom: 10,
                  maxWidth: "420px",
                  overflowWrap: "break-word",
                }}
              >
                <span style={{ fontWeight: "bold" }}>Khu vực:</span>
                <br />
                <span style={{}}>Mô tả:</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <Image
                      width={130}
                      height={130}
                      style={{
                        padding: 5,
                        borderRadius: 15,
                      }}
                      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                    />
                    <Button
                      title="Xóa hình ảnh"
                      style={{
                        width: 25,
                        height: 30,
                        position: "absolute",
                        top: 0,
                        right: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "red",
                        backgroundColor: "white",
                        borderRadius: 15,
                        transition: "background-color 0.3s ease",
                      }}
                      onClick={handleDeleteClick}
                    >
                      <DeleteOutlined style={{ fontSize: 15 }} />
                    </Button>
                  </div>
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <Image
                      width={130}
                      height={130}
                      style={{
                        padding: 5,
                        borderRadius: 15,
                      }}
                      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                    />
                    <Button
                      title="Xóa hình ảnh"
                      style={{
                        width: 25,
                        height: 30,
                        position: "absolute",
                        top: 0,
                        right: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "red",
                        backgroundColor: "white",
                        borderRadius: 15,
                        transition: "background-color 0.3s ease",
                      }}
                      onClick={handleDeleteClick}
                    >
                      <DeleteOutlined style={{ fontSize: 15 }} />
                    </Button>
                  </div>
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <Image
                      width={130}
                      height={130}
                      style={{
                        padding: 5,
                        borderRadius: 15,
                      }}
                      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                    />
                    <Button
                      title="Xóa hình ảnh"
                      style={{
                        width: 25,
                        height: 30,
                        position: "absolute",
                        top: 0,
                        right: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "red",
                        backgroundColor: "white",
                        borderRadius: 15,
                        transition: "background-color 0.3s ease",
                      }}
                      onClick={handleDeleteClick}
                    >
                      <DeleteOutlined style={{ fontSize: 15 }} />
                    </Button>
                  </div>
                </div>
              </div>
              <div
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontWeight: "bold" }}>Khu vực:</span>
                <br />
                <span style={{}}>Mô tả:</span>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Image
                    width={130}
                    height={130}
                    style={{
                      padding: 5,
                      borderRadius: 15,
                    }}
                    src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                  />

                  <Image
                    width={130}
                    height={130}
                    style={{
                      padding: 5,
                      borderRadius: 15,
                    }}
                    src="https://bold.vn/wp-content/uploads/2019/05/bold-academy-5.jpg"
                  />
                </div>
              </div>
              <div
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <span style={{ marginBottom: 10, fontWeight: "bold" }}>
                  Khu vực:
                </span>
                <br />
                <span style={{ marginBottom: 10 }}>Mô tả:</span>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Image
                    width={130}
                    height={130}
                    style={{
                      padding: 5,
                      borderRadius: 15,
                    }}
                    src="https://1.bp.blogspot.com/-HugzmnLycdc/X2yfMdqfrqI/AAAAAAAAIpM/fQBBxyAQGWswIhX85hT--TPeLq0teSDlwCLcBGAsYHQ/s640/anh-dep-viet-nam-2.jpg"
                  />
                  <Image
                    width={130}
                    height={130}
                    style={{
                      padding: 5,
                      borderRadius: 15,
                    }}
                    src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                  />
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col
          xxl={8}
          xl={8}
          lg={12}
          md={12}
          sm={20}
          xs={24}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <Card
            className="th-card-margin-bottom th-card-reset-margin"
            style={{
              width: "500px",
              height: "500px",
              display: "start",
              justifyContent: "space-around",
              alignItems: "center",
              borderRadius: 15,
              overflowY: "relative",
            }}
          >
            <ContainerHeader
              title="Sơn"
              buttons={ButtonAdd()}
              style={{ position: "sticky", top: 0, zIndex: 1 }}
            />
            <div style={{ overflowY: "auto", maxHeight: "410px" }}>
              <div
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  marginBottom: 10,
                  maxWidth: "420px",
                  overflowWrap: "break-word",
                }}
              >
                <span style={{ fontWeight: "bold" }}>Khu vực:</span>
                <br />
                <span style={{}}>Mô tả:</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <Image
                      width={130}
                      height={130}
                      style={{
                        padding: 5,
                        borderRadius: 15,
                      }}
                      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                    />
                    <Button
                      title="Xóa hình ảnh"
                      style={{
                        width: 25,
                        height: 30,
                        position: "absolute",
                        top: 0,
                        right: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "red",
                        backgroundColor: "white",
                        borderRadius: 15,
                        transition: "background-color 0.3s ease",
                      }}
                      onClick={handleDeleteClick}
                    >
                      <DeleteOutlined style={{ fontSize: 15 }} />
                    </Button>
                  </div>
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <Image
                      width={130}
                      height={130}
                      style={{
                        padding: 5,
                        borderRadius: 15,
                      }}
                      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                    />
                    <Button
                      title="Xóa hình ảnh"
                      style={{
                        width: 25,
                        height: 30,
                        position: "absolute",
                        top: 0,
                        right: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "red",
                        backgroundColor: "white",
                        borderRadius: 15,
                        transition: "background-color 0.3s ease",
                      }}
                      onClick={handleDeleteClick}
                    >
                      <DeleteOutlined style={{ fontSize: 15 }} />
                    </Button>
                  </div>
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <Image
                      width={130}
                      height={130}
                      style={{
                        padding: 5,
                        borderRadius: 15,
                      }}
                      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                    />
                    <Button
                      title="Xóa hình ảnh"
                      style={{
                        width: 25,
                        height: 30,
                        position: "absolute",
                        top: 0,
                        right: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "red",
                        backgroundColor: "white",
                        borderRadius: 15,
                        transition: "background-color 0.3s ease",
                      }}
                      onClick={handleDeleteClick}
                    >
                      <DeleteOutlined style={{ fontSize: 15 }} />
                    </Button>
                  </div>
                </div>
              </div>
              <div
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontWeight: "bold" }}>Khu vực:</span>
                <br />
                <span style={{}}>Mô tả:</span>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Image
                    width={130}
                    height={130}
                    style={{
                      padding: 5,
                      borderRadius: 15,
                    }}
                    src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                  />

                  <Image
                    width={130}
                    height={130}
                    style={{
                      padding: 5,
                      borderRadius: 15,
                    }}
                    src="https://bold.vn/wp-content/uploads/2019/05/bold-academy-5.jpg"
                  />
                </div>
              </div>
              <div
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <span style={{ marginBottom: 10, fontWeight: "bold" }}>
                  Khu vực:
                </span>
                <br />
                <span style={{ marginBottom: 10 }}>Mô tả:</span>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Image
                    width={130}
                    height={130}
                    style={{
                      padding: 5,
                      borderRadius: 15,
                    }}
                    src="https://1.bp.blogspot.com/-HugzmnLycdc/X2yfMdqfrqI/AAAAAAAAIpM/fQBBxyAQGWswIhX85hT--TPeLq0teSDlwCLcBGAsYHQ/s640/anh-dep-viet-nam-2.jpg"
                  />
                  <Image
                    width={130}
                    height={130}
                    style={{
                      padding: 5,
                      borderRadius: 15,
                    }}
                    src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                  />
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col
          xxl={8}
          xl={8}
          lg={12}
          md={12}
          sm={20}
          xs={24}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <Card
            className="th-card-margin-bottom th-card-reset-margin"
            style={{
              width: "500px",
              height: "500px",
              display: "start",
              justifyContent: "space-around",
              alignItems: "center",
              borderRadius: 15,
              overflowY: "relative",
            }}
          >
            <ContainerHeader
              title="Hàn"
              buttons={ButtonAdd()}
              style={{ position: "sticky", top: 0, zIndex: 1 }}
            />
            <div style={{ overflowY: "auto", maxHeight: "410px" }}>
              <div
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  marginBottom: 10,
                  maxWidth: "420px",
                  overflowWrap: "break-word",
                }}
              >
                <span style={{ fontWeight: "bold" }}>Khu vực:</span>
                <br />
                <span style={{}}>Mô tả:</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <Image
                      width={130}
                      height={130}
                      style={{
                        padding: 5,
                        borderRadius: 15,
                      }}
                      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                    />
                    <Button
                      title="Xóa hình ảnh"
                      style={{
                        width: 25,
                        height: 30,
                        position: "absolute",
                        top: 0,
                        right: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "red",
                        backgroundColor: "white",
                        borderRadius: 15,
                        transition: "background-color 0.3s ease",
                      }}
                      onClick={handleDeleteClick}
                    >
                      <DeleteOutlined style={{ fontSize: 15 }} />
                    </Button>
                  </div>
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <Image
                      width={130}
                      height={130}
                      style={{
                        padding: 5,
                        borderRadius: 15,
                      }}
                      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                    />
                    <Button
                      title="Xóa hình ảnh"
                      style={{
                        width: 25,
                        height: 30,
                        position: "absolute",
                        top: 0,
                        right: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "red",
                        backgroundColor: "white",
                        borderRadius: 15,
                        transition: "background-color 0.3s ease",
                      }}
                      onClick={handleDeleteClick}
                    >
                      <DeleteOutlined style={{ fontSize: 15 }} />
                    </Button>
                  </div>
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <Image
                      width={130}
                      height={130}
                      style={{
                        padding: 5,
                        borderRadius: 15,
                      }}
                      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                    />
                    <Button
                      title="Xóa hình ảnh"
                      style={{
                        width: 25,
                        height: 30,
                        position: "absolute",
                        top: 0,
                        right: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "red",
                        backgroundColor: "white",
                        borderRadius: 15,
                        transition: "background-color 0.3s ease",
                      }}
                      onClick={handleDeleteClick}
                    >
                      <DeleteOutlined style={{ fontSize: 15 }} />
                    </Button>
                  </div>
                </div>
              </div>
              <div
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontWeight: "bold" }}>Khu vực:</span>
                <br />
                <span style={{}}>Mô tả:</span>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Image
                    width={130}
                    height={130}
                    style={{
                      padding: 5,
                      borderRadius: 15,
                    }}
                    src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                  />

                  <Image
                    width={130}
                    height={130}
                    style={{
                      padding: 5,
                      borderRadius: 15,
                    }}
                    src="https://bold.vn/wp-content/uploads/2019/05/bold-academy-5.jpg"
                  />
                </div>
              </div>
              <div
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <span style={{ marginBottom: 10, fontWeight: "bold" }}>
                  Khu vực:
                </span>
                <br />
                <span style={{ marginBottom: 10 }}>Mô tả:</span>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Image
                    width={130}
                    height={130}
                    style={{
                      padding: 5,
                      borderRadius: 15,
                    }}
                    src="https://1.bp.blogspot.com/-HugzmnLycdc/X2yfMdqfrqI/AAAAAAAAIpM/fQBBxyAQGWswIhX85hT--TPeLq0teSDlwCLcBGAsYHQ/s640/anh-dep-viet-nam-2.jpg"
                  />
                  <Image
                    width={130}
                    height={130}
                    style={{
                      padding: 5,
                      borderRadius: 15,
                    }}
                    src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                  />
                </div>
              </div>
            </div>
          </Card>
        </Col>
        {/* );
            })} */}
      </Row>
      <ModalThemHinhAnh
        openModal={ActiveModalThemHinhAnh}
        openModalFS={setActiveModalThemHinhAnh}
        // saveTuChoi={saveTuChoi}
      />
    </div>
  );
}

export default SanPhamHinhAnh;
