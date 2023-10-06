import { DeleteOutlined } from "@ant-design/icons";
import { Card, Row, Col, Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes, map } from "lodash";

import React, { useEffect, useState } from "react";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  Table,
  ModalDeleteConfirm,
  EditableTableRow,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { getLocalStorage, getTokenInfo, reDataForTable } from "src/util/Common";

const { EditableRow, EditableCell } = EditableTableRow;

const TheoDoiDonHangForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);

  const [listVatTu, setListVatTu] = useState([]);

  const [info, setInfo] = useState({});
  useEffect(() => {
    const load = () => {
      if (includes(match.url, "chi-tiet")) {
        if (permission && permission.edit) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuNhanHang/theo-doi-don-hang/${id}?donVi_Id=${INFO.donVi_Id}`,
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
          const data = res.data;
          const chiTiet = JSON.parse(res.data.chiTietTheoDoiDonHang);
          chiTiet.forEach((ct, index) => {
            chiTiet[index].ngayHoanThanhDukien = data.ngayHoanThanhDukien;
            chiTiet[index].ngayHangVe = data.ngayHangVe;
            chiTiet[index].tenThuMua = data.tenThuMua;
          });
          setListVatTu(chiTiet);
          setInfo(data);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Quay lại trang bộ phận
   *
   */
  const goBack = () => {
    history.push(`${match.url.replace(`/${id}/chi-tiet`, "")}`);
  };

  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "vật tư";
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const newData = listVatTu.filter((d) => d.id !== item.id);
    setListVatTu(newData);
  };

  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const deleteItemVal =
      permission && permission.del && (type === "new" || type === "edit")
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <React.Fragment>
          <a {...deleteItemVal} title="Xóa">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };
  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Nhóm vật tư",
      dataIndex: "tenNhomVatTu",
      key: "tenNhomVatTu",
      align: "center",
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
    {
      title: "Số lượng mua",
      dataIndex: "soLuongMua",
      key: "soLuongMua",
      align: "center",
    },
    {
      title: "Hạng mục sử dụng",
      dataIndex: "hangMucSuDung",
      key: "hangMucSuDung",
      align: "center",
    },
    {
      title: "Ngày xác nhận hàng về",
      dataIndex: "ngayHoanThanhDukien",
      key: "ngayHoanThanhDukien",
      align: "center",
    },
    {
      title: "CV Thu mua",
      dataIndex: "tenThuMua",
      key: "tenThuMua",
      align: "center",
    },
    {
      title: "Ngày nhận hàng",
      dataIndex: "ngayHangVe",
      key: "ngayHangVe",
      align: "center",
    },
    {
      title: "SL hàng nhận",
      dataIndex: "soLuongNhan",
      key: "soLuongNhan",
      align: "center",
    },
    {
      title: "SL còn thiếu",
      dataIndex: "soLuongConThieu",
      key: "soLuongConThieu",
      align: "center",
    },
    {
      title: "SL dư",
      dataIndex: "soLuongDu",
      key: "soLuongDu",
      align: "center",
    },
    {
      title: "Kết quả",
      dataIndex: "ketQua",
      key: "ketQua",
      align: "center",
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
    },
  ];
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const handleSave = (row) => {
    const newData = [...listVatTu];
    const index = newData.findIndex((item) => row.vatTu_Id === item.vatTu_Id);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    // setDisableSave(true);
    setListVatTu(newData);
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
        handleSave: handleSave,
      }),
    };
  });

  const formTitle = (
    <span>
      Chi tiết theo dõi đơn hàng - <Tag color="green">{info.maPhieuYeuCau}</Tag>
    </span>
  );

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Row style={{ marginLeft: 2 }}>
          <Col>
            <img
              src={require("assets/images/usercall.png")}
              alt="usercall"
              width={40}
              height={40}
              style={{ marginRight: 10 }}
            />
          </Col>
          <h4 style={{ fontWeight: "bold" }}>
            Phiếu yêu cầu mua hàng -{" "}
            <Tag color="blue" style={{ marginBottom: 0 }}>
              {info && info.maPhieuYeuCau}
            </Tag>
            {/* <br /> */}
            <h5 style={{ color: "#0469B9" }}>
              Người yêu cầu:{" "}
              <Tag color="blue" style={{ margin: 0 }}>
                {info && info.tenNguoiYeuCau}
              </Tag>
            </h5>
          </h4>
        </Row>
        <Row>
          <Col span={12}>
            <h5>Bộ phận yêu cầu: {info.tenPhongBan}</h5>
          </Col>
          <Col span={12}>
            <h5>Ngày hoàn thành: {info.ngayHoanThanhDukien}</h5>
          </Col>
          <Col span={12}>
            <h5>File đính kèm: </h5>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <h5>Thông tin vật tư:</h5>
          </Col>
          <Table
            bordered
            columns={columns}
            scroll={{ x: 900, y: "55vh" }}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(listVatTu)}
            size="small"
            rowClassName={"editable-row"}
            pagination={false}
            loading={loading}
          />
        </Row>
      </Card>
    </div>
  );
};

export default TheoDoiDonHangForm;
