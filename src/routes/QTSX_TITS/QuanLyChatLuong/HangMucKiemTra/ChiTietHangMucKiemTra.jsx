import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Divider,
  Row,
  Col,
  Switch,
  Checkbox,
  Input,
  Empty,
  Tag,
  Modal as AntModal,
  Image,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { isEmpty, map } from "lodash";
import {
  ModalDeleteConfirm,
  Table,
  EditableTableRow,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { reDataForTable, setLocalStorage } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import ModalThemChiTiet from "./ModalThemChiTiet";
import { BASE_URL_API } from "src/constants/Config";

const { EditableRow, EditableCell } = EditableTableRow;

function ChiTietHangMucKiemTra({ match, history, permission }) {
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [ListChiTiet, setListChiTiet] = useState([]);
  const [id, setId] = useState(undefined);
  const [ActiveModalThemChiTiet, setActiveModalThemChiTiet] = useState(false);
  const [ChiTiet, setChiTiet] = useState({});
  const [info, setInfo] = useState({});
  const [editingRecord, setEditingRecord] = useState([]);
  const [DisabledModal, setDisabledModal] = useState(false);
  const [ListHinhAnh, setListHinhAnh] = useState([]);
  const [HangMuc, setHangMuc] = useState([]);

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
          const newData = "";
          setListChiTiet(
            res.data.list_HangMucKiemTraChiTiets &&
              res.data.list_HangMucKiemTraChiTiets
          );
        }
      })
      .catch((error) => console.error(error));
  };

  const actionContent = (item) => {
    const handleEdit = () => {
      setLocalStorage("themchitiet", info);
      history.push({
        pathname: `${match.url}/${item.id}/chinh-sua`,
      });
    };
    const add =
      permission && permission.add ? (
        <Link
          onClick={() => {
            setChiTiet({
              ...item,
              tits_qtsx_SanPham_Id: info && info.tits_qtsx_SanPham_Id,
              tits_qtsx_CongDoan_Id: info && info.tits_qtsx_CongDoan_Id,
              isNoiDung: info && info.isNoiDung,
              isSuDungHinhAnh: info && info.isSuDungHinhAnh,
              loai: "new",
            });
            setActiveModalThemChiTiet(true);
          }}
          title="Thêm mới"
        >
          <PlusCircleOutlined />
        </Link>
      ) : (
        <span disabled title="Thêm mới">
          <PlusCircleOutlined />
        </span>
      );

    const editItem =
      permission && permission.edit ? (
        <Link onClick={handleEdit} title="Sửa">
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa">
          <EditOutlined />
        </span>
      );

    const deleteVal =
      permission && permission.del
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        {add}
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
      item.maSo,
      "chi tiết hạng mục kiểm tra mã số"
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_HangMucKiemTra/chi-tiet/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        if (res.status !== 409) {
          getInfo(id);
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
    setLocalStorage("themchitiet", info);
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

  const handleInputChangeThuTu = (val, item, key) => {
    const ThuTu = val.target.value;

    if (!ThuTu || Number(ThuTu) <= 0) {
      setEditingRecord([
        ...editingRecord,
        { ...item, message: "Thứ tự phải là số lớn hơn 0 và bắt buộc" },
      ]);
    } else {
      const newData = editingRecord.filter((d) => d.id !== item.id);
      setEditingRecord(newData);
    }

    const updateThuTu = (data, itemId) => {
      data.forEach((item) => {
        if (item.id === itemId) {
          item.thuTu = ThuTu;
        } else if (item.list_HangMucKiemTraChiTiets) {
          updateThuTu(item.list_HangMucKiemTraChiTiets, itemId);
        }
      });
    };

    const newDataCopy = [...ListChiTiet];
    if (key) {
      newDataCopy.forEach((ct) => {
        updateThuTu(ct.list_HangMucKiemTraChiTiets, item.id);
      });
    } else {
      updateThuTu(newDataCopy, item.id);
    }

    setListChiTiet(newDataCopy);
  };

  const onChangeValueThuTu = (val, item) => {
    const newData = {
      tits_qtsx_HangMucKiemTraChiTiet_Id: item.id,
      thuTu: val.target.value,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_HangMucKiemTra/doi-thu-tu-hang-muc-kiem-tra-chi-tiet`,
          "PUT",
          newData,
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res.status !== 409) {
        getInfo(id);
      }
    });
  };

  const renderThuTuChiTiet = (item, key) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.id === item.id) {
        isEditing = true;
        message = ct.message;
      }
    });
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
          }}
          className={`input-item`}
          type="number"
          value={item.thuTu}
          onBlur={(val) => onChangeValueThuTu(val, item)}
          onChange={(val) => handleInputChangeThuTu(val, item, key)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

  const XemChiTiet = (record) => {
    setHangMuc(record);
    setListHinhAnh(record.list_HinhAnhs && JSON.parse(record.list_HinhAnhs));
    setDisabledModal(true);
  };

  const renderSoLuongHinhAnh = (record) => {
    return (
      <div>
        <a onClick={() => XemChiTiet(record)}>
          {record && record.soLuongHinhAnh}
        </a>
      </div>
    );
  };

  const renderCheckbox = (record) => {
    return <Checkbox checked={record.isNhapKetQua} disabled={true} />;
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
      title: "Mã số",
      dataIndex: "maSo",
      key: "maSo",
      align: "center",
    },
    {
      title: "Nội dung kiểm tra",
      dataIndex: "noiDungKiemTra",
      key: "noiDungKiemTra",
      align: "center",
    },
    {
      title: "Tiêu chuẩn đánh giá",
      dataIndex: "tieuChuanDanhGia",
      key: "tieuChuanDanhGia",
      align: "center",
    },
    {
      title: "Nhập kết quả",
      key: "isNhapKetQua",
      align: "center",
      width: 80,
      render: (record) => renderCheckbox(record),
    },
    {
      title: info && info.isNoiDung ? "Giá trị tiêu chuẩn" : "Giá trị Min",
      dataIndex: info && info.isNoiDung ? "giaTriTieuChuan" : "giaTriMin",
      key: info && info.isNoiDung ? "giaTriTieuChuan" : "giaTriMin",
      align: "center",
    },
    {
      title: info && info.isNoiDung ? "Phương pháp tiêu chuẩn" : "Giá trị Max",
      dataIndex: info && info.isNoiDung ? "phuongPhapTieuChuan" : "giaTriMax",
      key: info && info.isNoiDung ? "phuongPhapTieuChuan" : "giaTriMax",
      align: "center",
    },
    {
      title: "Thứ tự",
      key: "thuTu",
      align: "center",
      width: 100,
      render: (value) => renderThuTuChiTiet(value),
    },
    {
      title: "Trạm gia công",
      dataIndex: "tramGiaCong",
      key: "tramGiaCong",
      align: "center",
      width: 150,
    },
    {
      title: "Hình ảnh sản phẩm",
      key: "soLuongHinhAnh",
      align: "center",
      width: 100,
      render: (record) => renderSoLuongHinhAnh(record),
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

  const actionContentChildren = (item) => {
    const add =
      permission && permission.add ? (
        <Link
          onClick={() => {
            setChiTiet({
              ...item,
              tits_qtsx_SanPham_Id: info && info.tits_qtsx_SanPham_Id,
              tits_qtsx_CongDoan_Id: info && info.tits_qtsx_CongDoan_Id,
              isNoiDung: info && info.isNoiDung,
              isSuDungHinhAnh: info && info.isSuDungHinhAnh,
              loai: "new",
            });
            setActiveModalThemChiTiet(true);
          }}
          title="Thêm mới"
        >
          <PlusCircleOutlined />
        </Link>
      ) : (
        <span disabled title="Thêm mới">
          <PlusCircleOutlined />
        </span>
      );

    const editItem =
      permission && permission.edit ? (
        <Link
          onClick={() => {
            setChiTiet({
              ...item,
              tits_qtsx_SanPham_Id: info && info.tits_qtsx_SanPham_Id,
              tits_qtsx_CongDoan_Id: info && info.tits_qtsx_CongDoan_Id,
              isNoiDung: info && info.isNoiDung,
              isSuDungHinhAnh: info && info.isSuDungHinhAnh,
              loai: "edit",
            });
            setActiveModalThemChiTiet(true);
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
      permission && permission.del
        ? { onClick: () => deleteItemFuncChildren(item) }
        : { disabled: true };
    return (
      <div>
        {add}
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
  const deleteItemFuncChildren = (item) => {
    ModalDeleteConfirm(
      deleteItemActionChildren,
      item,
      item.maSo,
      "chi tiết hạng mục kiểm tra mã số"
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemActionChildren = (item) => {
    let url = `tits_qtsx_HangMucKiemTra/chi-tiet/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        if (res.status !== 409) {
          getInfo(id);
        }
      })
      .catch((error) => console.error(error));
  };

  let columsChiTietChildren = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã số",
      dataIndex: "maSo",
      key: "maSo",
      align: "center",
      width: 100,
    },
    {
      title: "Nội dung kiểm tra",
      dataIndex: "noiDungKiemTra",
      key: "noiDungKiemTra",
      align: "center",
      width: 150,
    },
    {
      title: "Tiêu chuẩn đánh giá",
      dataIndex: "tieuChuanDanhGia",
      key: "tieuChuanDanhGia",
      align: "center",
      width: 150,
    },
    {
      title: "Nhập kết quả",
      key: "isNhapKetQua",
      align: "center",
      width: 80,
      render: (record) => renderCheckbox(record),
    },
    {
      title: info && info.isNoiDung ? "Giá trị tiêu chuẩn" : "Giá trị Min",
      dataIndex: info && info.isNoiDung ? "giaTriTieuChuan" : "giaTriMin",
      key: info && info.isNoiDung ? "giaTriTieuChuan" : "giaTriMin",
      align: "center",
      width: 150,
    },
    {
      title: info && info.isNoiDung ? "Phương pháp tiêu chuẩn" : "Giá trị Max",
      dataIndex: info && info.isNoiDung ? "phuongPhapTieuChuan" : "giaTriMax",
      key: info && info.isNoiDung ? "phuongPhapTieuChuan" : "giaTriMax",
      align: "center",
      width: 150,
    },
    {
      title: "Thứ tự",
      key: "thuTu",
      align: "center",
      width: 100,
      render: (value) => renderThuTuChiTiet(value, "children"),
    },
    {
      title: "Trạm gia công",
      dataIndex: "tramGiaCong",
      key: "tramGiaCong",
      align: "center",
      width: 150,
    },
    {
      title: "Hình ảnh sản phẩm",
      key: "soLuongHinhAnh",
      align: "center",
      width: 80,
      render: (record) => renderSoLuongHinhAnh(record),
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 110,
      render: (value) => actionContentChildren(value),
    },
  ];
  const columsChildren = map(columsChiTietChildren, (col) => {
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

  const handleRefesh = () => {
    getInfo(id);
  };

  const goBack = () => {
    history.push(`${match.url.replace(`/${id}/chi-tiet`, "")}`);
  };

  const renderExpandable = (record, level) => {
    const childData = record.list_HangMucKiemTraChiTiets;

    if (!childData || childData.length === 0) {
      return null;
    }

    return (
      <Table
        style={{
          marginBottom: 10,
          marginLeft: 20,
          width: "95%",
        }}
        bordered
        columns={columsChildren}
        scroll={{ x: 1250 }}
        components={components}
        className="gx-table-responsive th-F1D065-head"
        dataSource={reDataForTable(childData)}
        size="small"
        rowClassName="editable-row"
        pagination={false}
        expandable={{
          expandedRowRender: (subRecord) =>
            renderExpandable(subRecord, level + 1),
        }}
      />
    );
  };

  const title = (
    <span>
      Hình ảnh của chi tiết{" "}
      <Tag color={"darkcyan"} style={{ fontSize: "14px" }}>
        {HangMuc && HangMuc.maSo}
      </Tag>
    </span>
  );

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
                  width: "220px",
                  fontWeight: "bold",
                }}
              >
                Sử dụng hình ảnh chi tiết:
              </span>
              {info && (
                <span
                  style={{
                    width: "calc(100% - 160px)",
                  }}
                >
                  <Switch checked={info.isSuDungHinhAnh} disabled />
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
            dataSource={reDataForTable(ListChiTiet)}
            size="small"
            rowClassName="editable-row"
            pagination={false}
            loading={loading}
            expandable={{
              expandedRowRender: (record) => renderExpandable(record, 1),
            }}
          />
        </Card>
      </Card>
      <ModalThemChiTiet
        openModal={ActiveModalThemChiTiet}
        openModalFS={setActiveModalThemChiTiet}
        refesh={handleRefesh}
        itemData={ChiTiet}
      />
      <AntModal
        title={title}
        className="th-card-reset-margin"
        open={DisabledModal}
        width={width > 786 ? `50%` : "80%"}
        closable={true}
        onCancel={() => setDisabledModal(false)}
        footer={null}
      >
        {ListHinhAnh > 0 ? (
          <div
            style={{
              overflowY: "auto",
              maxHeight: "500px",
            }}
          >
            {ListHinhAnh &&
              ListHinhAnh.map((hinhanh) => {
                return (
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      borderRadius: 15,
                      marginRight: 15,
                      marginBottom: 15,
                    }}
                  >
                    <Image
                      width={200}
                      height={200}
                      style={{
                        borderRadius: 15,
                        border: "1px solid #c8c8c8",
                        padding: 8,
                      }}
                      src={BASE_URL_API + hinhanh.hinhAnh}
                    />
                  </div>
                );
              })}
          </div>
        ) : (
          <div>
            <Empty style={{ height: "500px" }} />
          </div>
        )}
      </AntModal>
    </div>
  );
}

export default ChiTietHangMucKiemTra;
