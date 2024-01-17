import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col, Input } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
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
import { reDataForTable } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import ModalThemChiTiet from "./ModalThemChiTiet";
import ModalThemHangMucTieuDe from "./ModalThemHangMucTieuDe";

const { EditableRow, EditableCell } = EditableTableRow;

function ChiTietHangMucKiemTra({ match, history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [ListChiTiet, setListChiTiet] = useState([]);
  const [ListHangMuc, setListHangMuc] = useState([]);
  const [id, setId] = useState(undefined);
  const [ActiveModalThemChiTiet, setActiveModalThemChiTiet] = useState(false);
  const [ActiveModalThemHangMucTieuDe, setActiveModalThemHangMucTieuDe] =
    useState(false);
  const [ChiTiet, setChiTiet] = useState({});
  const [HangMucTieuDe, setHangMucTieuDe] = useState({});
  const [info, setInfo] = useState({});
  const [editingRecord, setEditingRecord] = useState([]);

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
          if (res.data.list_HangMucKiemTraTieuDePhus.length > 0) {
            if (res.data.list_HangMucKiemTraTieuDePhus[0].tieuDePhu) {
              setListHangMuc(res.data.list_HangMucKiemTraTieuDePhus);
            } else {
              setListChiTiet(
                res.data.list_HangMucKiemTraTieuDePhus[0]
                  .list_HangMucKiemTraChiTiets
              );
            }
          }
        }
      })
      .catch((error) => console.error(error));
  };

  const actionContent = (item) => {
    const addItem =
      permission && permission.edit ? (
        <Link
          onClick={() => {
            setChiTiet({
              ...item,
              tits_qtsx_SanPham_Id: info && info.tits_qtsx_SanPham_Id,
              tits_qtsx_CongDoan_Id: info && info.tits_qtsx_CongDoan_Id,
              tits_qtsx_HangMucKiemTraTieuDePhu_Id:
                item.tits_qtsx_HangMucKiemTraTieuDePhu_Id,
              tits_qtsx_HangMucKiemTra_Id:
                info && info.tits_qtsx_HangMucKiemTra_Id,
              isNoiDung: info && info.isNoiDung,
              type: "add",
            });
            setActiveModalThemChiTiet(true);
          }}
          title="Thêm"
        >
          <PlusCircleOutlined />
        </Link>
      ) : (
        <span disabled title="Thêm">
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
              tits_qtsx_HangMucKiemTra_Id:
                info && info.tits_qtsx_HangMucKiemTra_Id,
              isNoiDung: info && info.isNoiDung,
              type: "edit",
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
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        {addItem}
        <Divider type="vertical" />
        {editItem}
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa">
          <DeleteOutlined />
        </a>
      </div>
    );
  };
  const actionContentChiTiet = (item) => {
    const editItem =
      permission && permission.edit ? (
        <Link
          onClick={() => {
            setChiTiet({
              ...item,
              tits_qtsx_SanPham_Id: info && info.tits_qtsx_SanPham_Id,
              tits_qtsx_CongDoan_Id: info && info.tits_qtsx_CongDoan_Id,
              tits_qtsx_HangMucKiemTra_Id:
                info && info.tits_qtsx_HangMucKiemTra_Id,
              isNoiDung: info && info.isNoiDung,
              type: "edit",
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
        ? { onClick: () => deleteItemFuncChiTiet(item) }
        : { disabled: true };
    return (
      <div>
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
    ModalDeleteConfirm(deleteItemAction, item, item.tieuDePhu, "hạng mục");
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_HangMucKiemTra/tieu-de-phu/${item.tits_qtsx_HangMucKiemTraTieuDePhu_Id}`;
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
   * deleteItemFunc: Xoá item theo item
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFuncChiTiet = (item) => {
    ModalDeleteConfirm(
      deleteItemActionChiTiet,
      item,
      item.maSo,
      "hạng mục kiểm tra chi tiết "
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemActionChiTiet = (item) => {
    let url = `tits_qtsx_HangMucKiemTra/chi-tiet/${item.tits_qtsx_HangMucKiemTraChiTiet_Id}`;
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
  const handleThemChiTiet = () => {
    setChiTiet({
      tits_qtsx_SanPham_Id: info && info.tits_qtsx_SanPham_Id,
      tits_qtsx_CongDoan_Id: info && info.tits_qtsx_CongDoan_Id,
      tits_qtsx_HangMucKiemTra_Id: info && info.tits_qtsx_HangMucKiemTra_Id,
      isNoiDung: info && info.isNoiDung,
      tits_qtsx_HangMucKiemTraTieuDePhu_Id:
        ListChiTiet.length > 0
          ? ListChiTiet[0].tits_qtsx_HangMucKiemTraTieuDePhu_Id
          : undefined,
      type: "add",
    });
    setActiveModalThemChiTiet(true);
  };
  /**
   * Chuyển tới trang thêm mới chức năng
   *
   * @memberof ChucNang
   */
  const handleThemTieuDe = () => {
    setHangMucTieuDe({
      type: "new",
      tits_qtsx_HangMucKiemTra_Id: info.tits_qtsx_HangMucKiemTra_Id,
    });
    setActiveModalThemHangMucTieuDe(true);
  };
  const addButtonRender = () => {
    const btnTHM = (
      <Button
        icon={<PlusOutlined />}
        className="th-margin-bottom-0"
        type="primary"
        onClick={handleThemTieuDe}
        disabled={permission && !permission.add}
      >
        Thêm mới hạng mục
      </Button>
    );
    const btnTCT = (
      <Button
        icon={<PlusOutlined />}
        className="th-margin-bottom-0"
        type="primary"
        onClick={handleThemChiTiet}
        disabled={permission && !permission.add}
      >
        Thêm mới hạng mục chi tiết
      </Button>
    );
    if (ListChiTiet.length === 0 && ListHangMuc.length === 0) {
      return (
        <>
          {btnTHM}
          {btnTCT}
        </>
      );
    } else if (ListChiTiet.length > 0) {
      return btnTCT;
    } else if (ListHangMuc.length > 0) {
      return btnTHM;
    }
  };

  const handleInputChangeThuTu = (val, item, key) => {
    const ThuTu = val.target.value;

    if (!ThuTu || Number(ThuTu) <= 0) {
      setEditingRecord([
        ...editingRecord,
        { ...item, message: "Thứ tự phải là số lớn hơn 0 và bắt buộc" },
      ]);
    } else {
      const newData = editingRecord.filter(
        (d) =>
          d.tits_qtsx_HangMucKiemTraChiTiet_Id !==
          item.tits_qtsx_HangMucKiemTraChiTiet_Id
      );
      setEditingRecord(newData);
    }
    ListChiTiet.forEach((list) => {
      if (
        list.tits_qtsx_HangMucKiemTraTieuDePhu_Id.toLowerCase() ===
        item.tits_qtsx_HangMucKiemTraTieuDePhu_Id.toLowerCase()
      ) {
        list.list_HangMucKiemTraChiTiets.forEach((ct) => {
          if (
            ct.tits_qtsx_HangMucKiemTraChiTiet_Id.toLowerCase() ===
            item.tits_qtsx_HangMucKiemTraChiTiet_Id.toLowerCase()
          ) {
            ct.thuTu = ThuTu;
          }
        });
      }
    });

    setListChiTiet([...ListChiTiet]);
  };

  const onChangeValueThuTu = (val, item) => {
    const newData = {
      tits_qtsx_HangMucKiemTraChiTiet_Id:
        item.tits_qtsx_HangMucKiemTraChiTiet_Id,
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
  const onChangePUTieuDe = (val, item) => {
    const newData = {
      tits_qtsx_HangMucKiemTraTieuDePhu_Id:
        item.tits_qtsx_HangMucKiemTraTieuDePhu_Id,
      thuTu: val.target.value,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_HangMucKiemTra/doi-thu-tu-hang-muc-kiem-tra-tieu-de-phu`,
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
  const onChangeValueTieuDe = (val, item, key) => {
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

    const newListChiTiet = ListChiTiet.map((list) => {
      if (list.id === item.id) {
        return {
          ...list,
          thuTu: ThuTu,
        };
      }
      return list;
    });

    setListChiTiet(newListChiTiet);
  };
  const renderThuTuTieuDe = (item, key) => {
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
          onBlur={(val) => onChangePUTieuDe(val, item)}
          onChange={(val) => onChangeValueTieuDe(val, item, key)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };
  let renderHead = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContentChiTiet(value),
      fixed: "left",
    },
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
      title: info && info.isNoiDung ? "Giá trị tiêu chuẩn" : "Giá trị Min",
      dataIndex: info && info.isNoiDung ? "giaTriTieuChuan" : "giaTriMin",
      key: info && info.isNoiDung ? "giaTriTieuChuan" : "giaTriMin",
      align: "center",
      width: 100,
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
      width: 180,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  let renderHeadTieuDe = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 100,
      render: (value) => actionContent(value),
      fixed: "left",
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Hạng mục",
      dataIndex: "tieuDePhu",
      key: "tieuDePhu",
      align: "center",
    },
    {
      title: "Thứ tự",
      key: "thuTu",
      align: "center",
      width: 100,
      render: (value) => renderThuTuTieuDe(value),
    },
  ];
  const columnChiTiet = map(renderHead, (col) => {
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
  const columns = map(renderHeadTieuDe, (col) => {
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

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Chi tiết hạng mục kiểm tra"}
        description="Chi tiết hạng mục kiểm tra"
        back={goBack}
        buttons={addButtonRender()}
      />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin hạng mục kiểm tra"}
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
                width: "145px",
                fontWeight: "bold",
              }}
            >
              Sản phẩm:
            </span>
            {info && (
              <span
                style={{
                  width: "calc(100% - 145px)",
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
                width: "145px",
                fontWeight: "bold",
              }}
            >
              Công đoạn:
            </span>
            {info && (
              <span
                style={{
                  width: "calc(100% - 145px)",
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
                width: "145px",
                fontWeight: "bold",
              }}
            >
              Hạng mục kiểm tra:
            </span>
            {info && (
              <span
                style={{
                  width: "calc(100% - 145px)",
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
                width: "145px",
                fontWeight: "bold",
              }}
            >
              Tình trạng:
            </span>
            {info && (
              <span
                style={{
                  width: "calc(100% - 145px)",
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
                width: "145px",
                fontWeight: "bold",
              }}
            >
              Kiểu đánh giá:
            </span>
            {info && (
              <span
                style={{
                  width: "calc(100% - 145px)",
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
                width: "145px",
                fontWeight: "bold",
              }}
            >
              Ghi chú:
            </span>
            {info && (
              <span
                style={{
                  width: "calc(100% - 145px)",
                }}
              >
                {info.moTa}
              </span>
            )}
          </Col>
        </Row>
      </Card>
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Danh sách chi tiết hạng mục kiểm tra"}
      >
        {ListHangMuc.length > 0 ? (
          <Table
            bordered
            scroll={{ x: 1200, y: "55vh" }}
            columns={columns}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(ListHangMuc)}
            size="small"
            rowClassName="editable-row"
            pagination={false}
            loading={loading}
            expandable={{
              expandedRowRender: (record) => (
                <Table
                  style={{ marginLeft: "30px", width: "95%" }}
                  bordered
                  columns={columnChiTiet}
                  scroll={{ x: 800 }}
                  components={components}
                  className="gx-table-responsive th-F1D065-head"
                  dataSource={reDataForTable(
                    record.list_HangMucKiemTraChiTiets
                  )}
                  size="small"
                  rowClassName={"editable-row"}
                  pagination={false}
                />
              ),
            }}
          />
        ) : (
          <Table
            style={{ marginLeft: "30px", width: "95%" }}
            bordered
            columns={columnChiTiet}
            scroll={{ x: 800 }}
            components={components}
            className="gx-table-responsive th-F1D065-head"
            dataSource={reDataForTable(ListChiTiet)}
            size="small"
            rowClassName={"editable-row"}
            pagination={false}
          />
        )}
      </Card>
      <ModalThemChiTiet
        openModal={ActiveModalThemChiTiet}
        openModalFS={setActiveModalThemChiTiet}
        refesh={handleRefesh}
        itemData={ChiTiet}
      />
      <ModalThemHangMucTieuDe
        openModal={ActiveModalThemHangMucTieuDe}
        openModalFS={setActiveModalThemHangMucTieuDe}
        refesh={handleRefesh}
        itemData={HangMucTieuDe}
      />
    </div>
  );
}

export default ChiTietHangMucKiemTra;
