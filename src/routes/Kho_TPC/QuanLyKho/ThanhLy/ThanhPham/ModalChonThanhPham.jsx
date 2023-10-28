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
  const [ListVatTu, setListVatTu] = useState([]);
  const [editingRecord, setEditingRecord] = useState({});
  const [DisabledSave, setDisabledSave] = useState(true);
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
    const params = convertObjectToUrlParams({
      cauTrucKho_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_ViTriLuuKho/list-vi-tri-luu-kho-thanh-pham?${params}`,
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
        const newListVatTu = res.data.map((data) => {
          const vitri = `${data.tenKe ? `${data.tenKe}` : ""}${
            data.tenTang ? ` - ${data.tenTang}` : ""
          }${data.tenNgan ? ` - ${data.tenNgan}` : ""}`;
          return {
            ...data,
            tenVatTu: data.tenSanPham,
            maVatTu: data.maSanPham,
            vatTu_Id: data.sanPham_Id,
            lkn_ChiTietKhoBegin_Id: data.chiTietKho_Id,
            vatTu: `${data.maSanPham} - ${data.tenSanPham}${
              vitri ? ` (${vitri})` : ""
            }`,
            soLuongThanhLy: data.soLuong,
          };
        });
        const newData = newListVatTu.filter((data) => {
          return (
            itemData.listVatTu &&
            !itemData.listVatTu.some(
              (item) =>
                item.lkn_ChiTietKhoBegin_Id === data.lkn_ChiTietKhoBegin_Id
            )
          );
        });
        setListViTriKho(newData.length > 0 ? newData : newListVatTu);
      } else {
        setListViTriKho([]);
      }
    });
  };

  const renderSoLuongThanhLy = (record) => {
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
          value={record.soLuongThanhLy}
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
    if (isEmpty(sl) || Number(sl) <= 0) {
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
            soLuongThanhLy: sl,
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
      title: "SL thanh lý",
      key: "soLuongThanhLy",
      align: "center",
      render: (record) => renderSoLuongThanhLy(record),
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
    const newData = ListVatTu.filter(
      (data) => data.lkn_ChiTietKhoBegin_Id !== item.lkn_ChiTietKhoBegin_Id
    );
    setListVatTu(newData);

    const newDataListVatTu = ListVatTu.filter(
      (data) => data.lkn_ChiTietKhoBegin_Id === item.lkn_ChiTietKhoBegin_Id
    );
    setListViTriKho([...ListViTriKho, ...newDataListVatTu]);
  };

  let colListVatTu = [
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
      title: "Tên kệ",
      dataIndex: "tenKe",
      key: "tenKe",
      align: "center",
    },
    {
      title: "Số lượng thanh lý",
      dataIndex: "soLuongThanhLy",
      key: "soLuongThanhLy",
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
    setListVatTu([...ListVatTu, VatTu[0]]);
    const listvitrikho = ListViTriKho.filter(
      (d) => d.lkn_ChiTietKhoBegin_Id !== ViTriKho
    );
    setListViTriKho(listvitrikho);
    setViTriKho(null);
    setVatTu([]);
  };

  const XacNhanListDieuChuyen = () => {
    ThemVatTu(ListVatTu);
    setListViTriKho([]);
    setListVatTu([]);
    setVatTu([]);
    setViTriKho(null);
    openModalFS(false);
  };

  const handleCancel = () => {
    setListViTriKho([]);
    setListVatTu([]);
    setVatTu([]);
    setViTriKho(null);
    openModalFS(false);
  };

  return (
    <AntModal
      title={`Chọn sản phẩm thanh lý`}
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
                placeholder="Chọn sản phẩm thanh lý"
                optionsvalue={["lkn_ChiTietKhoBegin_Id", "vatTu"]}
                style={{ width: "calc(100% - 150px)" }}
                optionFilterProp={"name"}
                showSearch
                onSelect={HandleChonVatTu}
                value={ViTriKho}
              />
            </Col>
            <Table
              bordered
              columns={colVatTu}
              scroll={{ x: 850, y: 60 }}
              className="gx-table-responsive"
              dataSource={VatTu}
              size="small"
              pagination={false}
            />
            <Col span={24} align="right" style={{ marginTop: 10 }}>
              <Button
                type={"primary"}
                onClick={HandleThemVatTu}
                disabled={DisabledSave || VatTu.length === 0}
              >
                Thêm sản phẩm
              </Button>
            </Col>
          </Row>
          <Table
            bordered
            columns={colListVatTu}
            scroll={{ x: 800, y: "25vh" }}
            className="gx-table-responsive"
            dataSource={reDataForTable(ListVatTu)}
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
              disabled={ListVatTu.length === 0}
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
