import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Modal as AntModal, Col } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map } from "lodash";
import {
  ModalDeleteConfirm,
  Table,
  EditableTableRow,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { reDataForTable, getLocalStorage, getTokenInfo } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import ModalThemChiTiet from "./ModalThemChiTiet";

const { EditableRow, EditableCell } = EditableTableRow;

function ChiTietHangMucKiemTra({ match, history, permission }) {
  const { loading, data, width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [ListChiTiet, setListChiTiet] = useState([]);
  const [id, setId] = useState(undefined);
  const [info, setInfo] = useState({});
  const [ActiveModalThemChiTiet, setActiveModalThemChiTiet] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      setId(match.params.id);
      getInfo(match.params.id);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_HangMucKiemTra/${id}`,
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
          setInfo(res.data);
          setListChiTiet(
            res.data.list_HangMucKiemTraChiTiets &&
              res.data.list_HangMucKiemTraChiTiets
          );
        }
      })
      .catch((error) => console.error(error));
  };

  const actionContent = (item) => {
    const detail =
      permission && permission.view ? (
        <Link
          to={{
            pathname: `${match.url}/${item.tits_qtsx_HangMucKiemTra_Id}/chi-tiet`,
            state: { itemData: item },
          }}
          title="Chi tiết"
        >
          <SearchOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa">
          <SearchOutlined />
        </span>
      );

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

    const deleteVal =
      permission && permission.del && item.nguoiTao_Id === INFO.user_Id
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        {detail}
        <Divider type="vertical" />
        {editItem}
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa">
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
  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(
      deleteItemAction,
      item,
      item.tenHangMucKiemTra,
      "hạng mục kiểm tra "
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_HangMucKiemTra/${item.tits_qtsx_HangMucKiemTra_Id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          // getListData(LoaiSanPham, SanPham, CongDoan, keyword, page);
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
          icon={<PlusOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Thêm mới
        </Button>
      </>
    );
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
      // render: (record) => renderSoLuongHinhAnh(record),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
    },
    {
      title: "Tên công đoạn",
      dataIndex: "tenCongDoan",
      key: "tenCongDoan",
      align: "center",
    },
    {
      title: "Tên hạng mục kiểm tra",
      dataIndex: "tenHangMucKiemTra",
      key: "tenHangMucKiemTra",
      align: "center",
    },
    {
      title: "Kiểu đánh giá",
      dataIndex: "kieuDanhGia",
      key: "kieuDanhGia",
      align: "center",
    },
    {
      title: "Thứ tự",
      dataIndex: "thuTu",
      key: "thuTu",
      align: "center",
      width: 80,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 110,
      render: (value) => actionContent(value),
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

  const goBack = () => {
    history.push(`${match.url.replace(`/${id}/chi-tiet`, "")}`);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Chi tiết hạng mục kiểm tra"}
        description="Chi tiết hạng mục kiểm tra"
        back={goBack}
        buttons={addButtonRender()}
      />

      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Card
          className="th-card-margin-bottom th-card-reset-margin"
          title={"Thông tin chi tiết hạng mục kiểm tra"}
          headStyle={{
            textAlign: "center",
            backgroundColor: "#0469B9",
            color: "#fff",
          }}
        >
          <Row
            style={{
              padding: "0px 50px",
            }}
          >
            <Col
              lg={12}
              xs={24}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <span
                style={{
                  width: "160px",
                  fontWeight: "bold",
                }}
              >
                Sản phẩm:
              </span>
              {info && (
                <span
                  style={{
                    width: "calc(100% - 160px)",
                  }}
                >
                  {info.tenSanPham}
                </span>
              )}
            </Col>
            <Col
              lg={12}
              xs={24}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <span
                style={{
                  width: "160px",
                  fontWeight: "bold",
                }}
              >
                Công đoạn:
              </span>
              {info && (
                <span
                  style={{
                    width: "calc(100% - 160px)",
                  }}
                >
                  {info.tenCongDoan}
                </span>
              )}
            </Col>
            <Col
              lg={12}
              xs={24}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <span
                style={{
                  width: "160px",
                  fontWeight: "bold",
                }}
              >
                Hạng mục kiểm tra:
              </span>
              {info && (
                <span
                  style={{
                    width: "calc(100% - 160px)",
                  }}
                >
                  {info.tenHangMucKiemTra}
                </span>
              )}
            </Col>
            <Col
              lg={12}
              xs={24}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <span
                style={{
                  width: "160px",
                  fontWeight: "bold",
                }}
              >
                Tình trạng:
              </span>
              {info && (
                <span
                  style={{
                    width: "calc(100% - 160px)",
                  }}
                >
                  {info.isSuDung === true ? "Đang sử dụng" : "Không sử dụng"}
                </span>
              )}
            </Col>
            <Col
              lg={12}
              xs={24}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <span
                style={{
                  width: "160px",
                  fontWeight: "bold",
                }}
              >
                Kiểu đánh giá:
              </span>
              {info && (
                <span
                  style={{
                    width: "calc(100% - 160px)",
                  }}
                >
                  {info.kieuDanhGia}
                </span>
              )}
            </Col>
            <Col
              lg={12}
              xs={24}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <span
                style={{
                  width: "160px",
                  fontWeight: "bold",
                }}
              >
                Ghi chú:
              </span>
              {info && (
                <span
                  style={{
                    width: "calc(100% - 160px)",
                  }}
                >
                  {info.moTa}
                </span>
              )}
            </Col>
          </Row>
          <Table
            bordered
            scroll={{ x: 1200, y: "55vh" }}
            columns={columns}
            components={components}
            className="gx-table-responsive"
            dataSource={ListChiTiet}
            size="small"
            rowClassName={"editable-row"}
            pagination={false}
            loading={loading}
          />
        </Card>
      </Card>
      <ModalThemChiTiet
        openModal={ActiveModalThemChiTiet}
        openModalFS={setActiveModalThemChiTiet}
        itemData={info}
      />
    </div>
  );
}

export default ChiTietHangMucKiemTra;
