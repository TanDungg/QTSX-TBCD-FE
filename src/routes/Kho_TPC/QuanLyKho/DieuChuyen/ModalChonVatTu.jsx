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
  const [ListViTriKho, setListViTriKho] = useState([]);
  const [ViTriKho, setViTriKho] = useState(null);
  const [VatTu, setVatTu] = useState([]);
  const [ListVatTu, setListVatTu] = useState([]);
  const [SoLuongDieuChuyen, setSoLuongDieuChuyen] = useState(0);
  const [hasError, setHasError] = useState(false);
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
          `lkn_ViTriLuuKho/list-vi-tri-luu-kho-vat-tu?${params}`,
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
        const newListVatTu = res.data.filter((data) => {
          return (
            itemData.listVatTu &&
            !itemData.listVatTu.some(
              (item) =>
                item.lkn_ChiTietKhoVatTu_Id === data.lkn_ChiTietKhoVatTu_Id
            )
          );
        });

        const newData = newListVatTu.map((data) => {
          const vitri = `${data.tenKe ? `${data.tenKe}` : ""}${
            data.tenTang ? ` - ${data.tenTang}` : ""
          }${data.tenNgan ? ` - ${data.tenNgan}` : ""}`;

          return {
            ...data,
            vatTu: `${data.maVatTu} - ${data.tenVatTu} ${
              vitri ? `(${vitri})` : ""
            }`,
            soLuongDieuChuyen: data.soLuong,
          };
        });
        setListViTriKho(newData);

        const newSoLuong = {};
        newData.forEach((data) => {
          newSoLuong[data.lkn_ChiTietKhoVatTu_Id] = data.soLuong;
        });
        setSoLuongDieuChuyen(newSoLuong);
      } else {
        setListViTriKho([]);
      }
    });
  };

  const renderSoLuongDieuChuyen = () => {
    return (
      <div>
        <Input
          min={0}
          style={{
            textAlign: "center",
            width: "100%",
            borderColor: hasError ? "red" : "",
          }}
          className={`input-item ${hasError ? "input-error" : ""}`}
          value={
            SoLuongDieuChuyen &&
            SoLuongDieuChuyen[VatTu[0].lkn_ChiTietKhoVatTu_Id]
          }
          type="number"
          onChange={(val) => handleInputChange(val)}
        />
      </div>
    );
  };

  const handleInputChange = (val) => {
    const sl = val.target.value;
    if (sl > VatTu[0].soLuong) {
      setHasError(true);
      Helpers.alertError(
        "Số lượng điều chuyển phải nhỏ hơn hoặc bằng số lượng trong kho"
      );
      setDisabledSave(true);
    } else {
      setDisabledSave(false);
      setHasError(false);
    }
    setSoLuongDieuChuyen((prevSoLuongDieuChuyen) => ({
      ...prevSoLuongDieuChuyen,
      [VatTu[0].lkn_ChiTietKhoVatTu_Id]: sl,
    }));
    setVatTu((prevVatTu) => {
      return prevVatTu.map((item) => {
        if (VatTu[0].lkn_ChiTietKhoVatTu_Id === item.lkn_ChiTietKhoVatTu_Id) {
          return {
            ...item,
            soLuongDieuChuyen: sl ? parseFloat(sl) : 0,
          };
        }
        return item;
      });
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
      title: "Tên kệ",
      dataIndex: "tenKe",
      key: "tenKe",
      align: "center",
    },
    {
      title: "Tên tầng",
      dataIndex: "tenTang",
      key: "tenTang",
      align: "center",
    },
    {
      title: "Tên ngăn",
      dataIndex: "tenNgan",
      key: "tenNgan",
      align: "center",
    },
    {
      title: "SL trong kho",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Thời hạn sử dụng",
      dataIndex: "thoiGianSuDung",
      key: "thoiGianSuDung",
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
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
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
      title: "Tên kệ",
      dataIndex: "tenKe",
      key: "tenKe",
      align: "center",
    },
    {
      title: "Tên tầng",
      dataIndex: "tenTang",
      key: "tenTang",
      align: "center",
    },
    {
      title: "Số lượng điều chuyển",
      dataIndex: "soLuongDieuChuyen",
      key: "soLuongDieuChuyen",
      align: "center",
    },
    {
      title: "Thời hạn sử dụng",
      dataIndex: "thoiGianSuDung",
      key: "thoiGianSuDung",
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
      (d) => d.lkn_ChiTietKhoVatTu_Id === value
    );
    setViTriKho(value);
    setVatTu(vattu);
    setDisabledSave(false);
  };

  const HandleThemVatTu = () => {
    setListVatTu([...ListVatTu, VatTu[0]]);
    const listvitrikho = ListViTriKho.filter(
      (d) => d.lkn_ChiTietKhoVatTu_Id !== ViTriKho
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
    openModalFS(false);
  };

  return (
    <AntModal
      title={`Chọn vật tư điều chuyển`}
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
                data={ListViTriKho ? ListViTriKho : []}
                placeholder="Chọn vật tư điều chuyển"
                optionsvalue={["lkn_ChiTietKhoVatTu_Id", "vatTu"]}
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
                disabled={DisabledSave}
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
