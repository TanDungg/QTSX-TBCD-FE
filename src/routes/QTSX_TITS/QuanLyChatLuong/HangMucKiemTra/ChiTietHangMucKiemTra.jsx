import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col, Checkbox, Input } from "antd";
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
import { reDataForTable, setLocalStorage } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import ModalThemChiTiet from "./ModalThemChiTiet";

const { EditableRow, EditableCell } = EditableTableRow;

function ChiTietHangMucKiemTra({ match, history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [ListChiTiet, setListChiTiet] = useState([]);
  const [id, setId] = useState(undefined);
  const [ActiveModalThemChiTiet, setActiveModalThemChiTiet] = useState(false);
  const [ChiTiet, setChiTiet] = useState({});
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
          setListChiTiet(
            res.data.list_HangMucKiemTraChiTiets &&
              res.data.list_HangMucKiemTraChiTiets
          );
        }
      })
      .catch((error) => console.error(error));
  };

  const actionContent = (item) => {
    const editItem =
      permission && permission.edit ? (
        <Link
          onClick={() => {
            setChiTiet({
              ...item,
              tits_qtsx_SanPham_Id: info && info.tits_qtsx_SanPham_Id,
              tits_qtsx_CongDoan_Id: info && info.tits_qtsx_CongDoan_Id,
              isNoiDung: info && info.isNoiDung,
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
        ? { onClick: () => deleteItemFunc(item) }
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
  const handleThemChiTiet = () => {
    setChiTiet({
      ...info,
      tits_qtsx_SanPham_Id: info && info.tits_qtsx_SanPham_Id,
      tits_qtsx_CongDoan_Id: info && info.tits_qtsx_CongDoan_Id,
      isNoiDung: info && info.isNoiDung,
      loai: "new",
    });
    setActiveModalThemChiTiet(true);
  };
  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<PlusOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleThemChiTiet}
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

  let renderHead = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
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
        />
      </Card>
      <ModalThemChiTiet
        openModal={ActiveModalThemChiTiet}
        openModalFS={setActiveModalThemChiTiet}
        refesh={handleRefesh}
        itemData={ChiTiet}
      />
    </div>
  );
}

export default ChiTietHangMucKiemTra;
