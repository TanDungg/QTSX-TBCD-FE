import { Modal as AntModal, Card, Input, Button, Row, Col } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";
import { ModalDeleteConfirm, Select, Table } from "src/components/Common";
import { DeleteOutlined } from "@ant-design/icons";
import { isEmpty } from "lodash";

function ModalChonVatTu({ openModalFS, openModal, itemData, ThemVatTu }) {
  const { width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [ListViTriKho, setListViTriKho] = useState([]);
  const [ViTriKho, setViTriKho] = useState(null);
  const [VatTu, setVatTu] = useState([]);
  const [ListSanPham, setListSanPham] = useState([]);
  const [DisabledSave, setDisabledSave] = useState(true);
  const [editingRecord, setEditingRecord] = useState({});

  useEffect(() => {
    if (openModal) {
      getListViTriKho(itemData.kho_Id);
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);
  const getListViTriKho = (cauTrucKho_Id) => {
    const param = convertObjectToUrlParams({
      cauTrucKho_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_ViTriLuuKho/list-vi-tri-luu-kho-thanh-pham?${param}`,
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
          const newData = res.data.map((dt) => {
            return {
              ...dt,
              tenVatTu: dt.tenSanPham,
              vatTu_Id: dt.sanPham_Id,
              maVatTu: dt.maSanPham,
              vatTu: dt.maSanPham + " - " + dt.tenSanPham,
              lkn_ChiTietKhoBegin_Id: dt.chiTietKho_Id,
              soLuongDieuChuyen: dt.soLuong,
            };
          });
          setListViTriKho(newData);
        } else {
          setListViTriKho([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const renderSoLuongDieuChuyen = (record) => {
    const isEditing =
      editingRecord.lkn_ChiTietKhoBegin_Id === record.lkn_ChiTietKhoBegin_Id;
    return (
      <div>
        <Input
          min={0}
          style={{
            textAlign: "center",
            width: "100%",
            borderColor: isEditing ? "red" : "",
          }}
          className={`input-item ${isEditing ? "input-error" : ""}`}
          value={record.soLuongDieuChuyen}
          type="number"
          onChange={(val) => handleInputChange(val, record)}
        />
        {isEditing && (
          <div style={{ color: "red" }}>{editingRecord.message}</div>
        )}
      </div>
    );
  };

  const handleInputChange = (val, record) => {
    const sl = val.target.value;
    if (isEmpty(sl) || sl === "0") {
      record.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
      setEditingRecord(record);

      setDisabledSave(true);
    } else if (sl > record.soLuong) {
      record.message =
        "Số lượng điều chuyển phải nhỏ hơn hoặc bằng số lượng trong kho";
      setEditingRecord(record);
      setDisabledSave(true);
    } else {
      setEditingRecord({});
      setDisabledSave(false);
    }

    setVatTu((prevVatTu) => {
      return prevVatTu.map((item) => {
        if (VatTu[0].lkn_ChiTietKhoBegin_Id === item.lkn_ChiTietKhoBegin_Id) {
          return {
            ...item,
            soLuongDieuChuyen: sl,
          };
        }
        return item;
      });
    });
  };

  let colVatTu = [
    {
      title: "Mã sản phẩm",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Kệ",
      dataIndex: "tenKe",
      key: "tenKe",
      align: "center",
    },
    {
      title: "SL trong kho",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "SL điều chuyển",
      key: "soLuongDieuChuyen",
      align: "center",
      render: (record) => renderSoLuongDieuChuyen(record),
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
  ];

  const actionContent = (item) => {
    const deleteVal = { onClick: () => deleteItemFunc(item) };
    return (
      <div>
        <a {...deleteVal} title="Xóa">
          <DeleteOutlined />
        </a>
      </div>
    );
  };

  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, "sản phẩm");
  };

  const deleteItemAction = (item) => {
    const newData = ListSanPham.filter(
      (data) => data.lkn_ChiTietKhoBegin_Id !== item.lkn_ChiTietKhoBegin_Id
    );
    setListSanPham(newData);
  };

  let colListSanPham = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã sản phẩm",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Kệ",
      dataIndex: "tenKe",
      key: "tenKe",
      align: "center",
    },
    {
      title: "Số lượng điều chuyển",
      dataIndex: "soLuongDieuChuyen",
      key: "soLuongDieuChuyen",
      align: "center",
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
  ];

  const HandleChonVatTu = (value) => {
    const vattu = ListViTriKho.filter(
      (d) => d.lkn_ChiTietKhoBegin_Id === value
    );
    setViTriKho(value);
    setVatTu(vattu);
    setDisabledSave(false);
  };

  const HandleThemVatTu = () => {
    setListSanPham([...ListSanPham, VatTu[0]]);
    const listvitrikho = ListViTriKho.filter(
      (d) => d.lkn_ChiTietKhoBegin_Id !== ViTriKho
    );
    setListViTriKho(listvitrikho);
    setViTriKho(null);
    setVatTu([]);
  };

  const XacNhanListDieuChuyen = () => {
    ThemVatTu(ListSanPham);
    setListViTriKho([]);
    setListSanPham([]);
    setVatTu([]);
    setViTriKho(null);
    openModalFS(false);
  };

  const handleCancel = () => {
    setListViTriKho([]);
    setListSanPham([]);
    setVatTu([]);
    setViTriKho(null);
    openModalFS(false);
  };

  return (
    <AntModal
      title={`Chọn sản phẩm điều chuyển`}
      open={openModal}
      width={width > 1000 ? `80%` : "100%"}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom">
          <Row
            style={{
              padding: 15,
              border: "1px solid #00688B",
              borderRadius: 15,
              margin: 15,
            }}
            justify={"center"}
          >
            <Col
              xxl={12}
              xl={16}
              lg={20}
              md={20}
              sm={24}
              xs={24}
              style={{
                marginBottom: 15,
                display: "flex",
                alignItems: "center",
              }}
            >
              <span style={{ width: "150px", fontWeight: "bold" }}>
                Chọn sản phẩm:
              </span>
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListViTriKho ? ListViTriKho : []}
                placeholder="Chọn sản phẩm điều chuyển"
                optionsvalue={["lkn_ChiTietKhoBegin_Id", "vatTu"]}
                style={{ width: "calc(100% - 100px)" }}
                optionFilterProp={"name"}
                showSearch
                onSelect={HandleChonVatTu}
                value={ViTriKho}
              />
            </Col>
            <Table
              bordered
              columns={colVatTu}
              scroll={{ x: 850, y: 100 }}
              className="gx-table-responsive"
              dataSource={VatTu}
              size="small"
              pagination={false}
            />
            <Col span={24} align="right" style={{ marginTop: 10 }}>
              <Button
                type={"primary"}
                onClick={HandleThemVatTu}
                disabled={DisabledSave}
              >
                Thêm sản phẩm
              </Button>
            </Col>
          </Row>
          <Table
            bordered
            columns={colListSanPham}
            scroll={{ x: 800, y: "25vh" }}
            className="gx-table-responsive"
            dataSource={reDataForTable(ListSanPham)}
            size="small"
            pagination={false}
          />
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 10 }}
          >
            <Button
              className="th-btn-margin-bottom-0"
              type="primary"
              onClick={XacNhanListDieuChuyen}
              disabled={ListSanPham.length === 0}
            >
              Xác nhận
            </Button>
          </div>
        </Card>
      </div>
    </AntModal>
  );
}

export default ModalChonVatTu;
