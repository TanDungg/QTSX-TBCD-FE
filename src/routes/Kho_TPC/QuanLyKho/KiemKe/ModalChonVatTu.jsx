import { Modal as AntModal, Card, Input, Button, Row, Col } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";
import { ModalDeleteConfirm, Select, Table } from "src/components/Common";
import Helpers from "src/helpers";
import { DeleteOutlined } from "@ant-design/icons";

function ModalChonVatTu({ openModalFS, openModal, itemData, ThemVatTu }) {
  const { width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [ListVatTuKho, setListVatTuKho] = useState([]);
  const [VatTuKho, setVatTuKho] = useState(null);
  const [VatTu, setVatTu] = useState([]);
  const [ListVatTu, setListVatTu] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListVatTu(itemData.xuong);
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListVatTu = (phongBan_Id) => {
    const params = convertObjectToUrlParams({
      phongBan_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuKiemKe/tong-vat-tu-theo-phong-ban?${params}`,
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
        const vatTu = res.data.map((data) => {
          return {
            ...data,
            vatTu: `${data.maVatTu} - ${data.tenVatTu}`,
          };
        });
        const newData = itemData.listVatTu
          ? vatTu.filter((data) => {
              return !itemData.listVatTu.some(
                (item) => item.vatTu_Id === data.vatTu_Id
              );
            })
          : vatTu;
        setListVatTuKho(newData);
      } else {
        setListVatTuKho([]);
      }
    });
  };

  let colVatTu = [
    {
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Tên nhóm vật tư",
      dataIndex: "tenNhomVatTu",
      key: "tenNhomVatTu",
      align: "center",
    },
    {
      title: "SL trong kho",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
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
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, "vật tư");
  };

  const deleteItemAction = (item) => {
    const newData = ListVatTu.filter(
      (data) => data.lkn_ChiTietKhoVatTu_Id !== item.lkn_ChiTietKhoVatTu_Id
    );
    setListVatTu(newData);
  };

  let colListVatTu = [
    {
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Tên nhóm vật tư",
      dataIndex: "tenNhomVatTu",
      key: "tenNhomVatTu",
      align: "center",
    },
    {
      title: "SL trong kho",
      dataIndex: "soLuong",
      key: "soLuong",
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
    setVatTuKho(value);
    const vattu = ListVatTuKho.filter((d) => d.vatTu_Id === value);
    setVatTu(vattu);
  };

  const HandleThemVatTu = () => {
    setListVatTu([...ListVatTu, VatTu[0]]);
    const listvitrikho = ListVatTuKho.filter(
      (d) => d.vatTu_Id !== VatTu[0].vatTu_Id
    );
    setListVatTuKho(listvitrikho);
    setVatTuKho(null);
    setVatTu([]);
  };

  const XacNhanListKiemKe = () => {
    ThemVatTu(ListVatTu);
    setListVatTuKho([]);
    setListVatTu([]);
    setVatTuKho(null);
    setVatTu([]);
    openModalFS(false);
  };

  const handleCancel = () => {
    setListVatTuKho([]);
    setListVatTu([]);
    setVatTuKho(null);
    setVatTu([]);
    openModalFS(false);
  };

  return (
    <AntModal
      title={`Chọn vật tư trả nhà cung cấp`}
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
              <span style={{ width: "100px", fontWeight: "bold" }}>
                Chọn vật tư:
              </span>
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListVatTuKho ? ListVatTuKho : []}
                placeholder="Chọn vật tư điều chuyển"
                optionsvalue={["vatTu_Id", "vatTu"]}
                style={{ width: "calc(100% - 100px)" }}
                optionFilterProp={"name"}
                showSearch
                onSelect={HandleChonVatTu}
                value={VatTuKho}
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
                disabled={VatTu.length === 0}
              >
                Thêm vật tư
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
              onClick={XacNhanListKiemKe}
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
