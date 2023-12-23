import { Modal as AntModal, Card, Input, Button, Row, Col, Form } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Select,
  Table,
} from "src/components/Common";
import { DeleteOutlined } from "@ant-design/icons";
import { isEmpty, map } from "lodash";
import { DEFAULT_FORM_THEMVATTU } from "src/constants/Config";

const FormItem = Form.Item;
const { EditableRow, EditableCell } = EditableTableRow;

function ModalChonVatTu({ openModalFS, openModal, itemData, DataThemVatTu }) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  const [ListKhoVatTuDi, setListKhoVatTuDi] = useState([]);
  const [ListVatPham, setListVatPham] = useState([]);
  const [ListViTriKho, setListViTriKho] = useState([]);
  const [DataListVatPham, setDataListVatPham] = useState([]);
  const [editingRecord, setEditingRecord] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListKho();
      setFieldsValue({
        themvattu: {
          tits_qtsx_CauTrucKhoBegin_Id: itemData.tits_qtsx_CauTrucKhoBegin_Id,
        },
      });
      getListViTriKho(itemData.tits_qtsx_CauTrucKhoBegin_Id);
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CauTrucKho/cau-truc-kho-by-thu-tu?thutu=1&&isThanhPham=false`,
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
          setListKhoVatTuDi(res.data);
        } else {
          setListKhoVatTuDi([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListViTriKho = (tits_qtsx_CauTrucKho_Id, tits_qtsx_VatTu_Id) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_CauTrucKho_Id,
      tits_qtsx_VatTu_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ViTriLuuKhoVatTu/vat-pham-by-kho?${params}`,
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
        if (!tits_qtsx_VatTu_Id) {
          const newVatTu = res.data.map((data) => {
            return {
              ...data,
              vatPham: `${data.maVatPham} - ${data.tenVatPham}`,
            };
          });
          setListVatPham(newVatTu);
        } else {
          const newListViTri = res.data.map((data) => {
            const vitri = `${data.maKe ? `${data.maKe}` : ""}${
              data.maTang ? ` - ${data.maTang}` : ""
            }${data.maNgan ? ` - ${data.maNgan}` : ""}`;
            return {
              ...data,
              viTri: vitri ? vitri : data.tenKho,
              soLuong: data.soLuongTonKho,
            };
          });
          const newData = newListViTri.filter((data) => {
            return (
              itemData.dataListVatPham &&
              !itemData.dataListVatPham.some(
                (item) =>
                  item.tits_qtsx_ChiTietKhoBegin_Id ===
                  data.tits_qtsx_ChiTietKhoBegin_Id
              )
            );
          });
          setListViTriKho(newData);
        }
      } else {
        setListViTriKho([]);
      }
    });
  };

  const handleInputChange = (val, item) => {
    const soLuongDieuChuyen = val.target.value;
    if (isEmpty(soLuongDieuChuyen) || soLuongDieuChuyen === "0") {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message =
        "Số lượng điều chuyển phải lớn hơn hoặc bằng 0 và bắt buộc";
    } else if (soLuongDieuChuyen > item.soLuongTonKho) {
      setFieldTouch(false);
      item.message = `Số lượng điều chuyển không được lớn hơn ${item.soLuongTonKho}`;
      setEditingRecord([...editingRecord, item]);
    } else {
      const newData = editingRecord.filter(
        (d) =>
          d.tits_qtsx_ChiTietKhoBegin_Id !== item.tits_qtsx_ChiTietKhoBegin_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...ListViTriKho];
    newData.forEach((ct, index) => {
      if (
        ct.tits_qtsx_ChiTietKhoBegin_Id === item.tits_qtsx_ChiTietKhoBegin_Id
      ) {
        ct.soLuong = soLuongDieuChuyen;
      }
    });
    setListVatPham(newData);
  };

  const renderSoLuongDieuChuyen = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (
        ct.tits_qtsx_ChiTietKhoBegin_Id === item.tits_qtsx_ChiTietKhoBegin_Id
      ) {
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
            borderColor: isEditing ? "red" : "",
          }}
          className={`input-item`}
          type="number"
          value={item.soLuong}
          onChange={(val) => handleInputChange(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

  const renderMoTa = (item) => {
    return (
      <Input
        style={{
          textAlign: "center",
          width: "100%",
        }}
        className={`input-item`}
        value={item.moTa}
        onChange={(val) => handleMoTa(val, item)}
      />
    );
  };

  const handleMoTa = (value, record) => {
    const ghichu = value.target.value;
    setFieldTouch(true);
    const newData = [...ListViTriKho];
    newData.forEach((ct, index) => {
      if (
        ct.tits_qtsx_ChiTietKhoBegin_Id === record.tits_qtsx_ChiTietKhoBegin_Id
      ) {
        ct.moTa = ghichu;
      }
    });
    setListVatPham(newData);
  };

  let colValuesViTri = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã vật tư",
      dataIndex: "maVatPham",
      key: "maVatPham",
      align: "center",
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatPham",
      key: "tenVatPham",
      align: "center",
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
    {
      title: "Vị trí",
      dataIndex: "viTri",
      key: "viTri",
      align: "center",
    },
    {
      title: "SL điều chuyển",
      key: "soLuong",
      align: "center",
      render: (record) => renderSoLuongDieuChuyen(record),
    },
    {
      title: "Mô tả",
      key: "moTa",
      align: "center",
      render: (record) => renderMoTa(record),
    },
  ];

  const columnsvitri = map(colValuesViTri, (col) => {
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
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatPham, "vật tư");
  };

  const deleteItemAction = (item) => {
    const newData = ListVatPham.filter(
      (data) =>
        data.tits_qtsx_ChiTietKhoBegin_Id !== item.tits_qtsx_ChiTietKhoBegin_Id
    );
    setListVatPham(newData);
  };

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã vật tư",
      dataIndex: "maVatPham",
      key: "maVatPham",
      align: "center",
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatPham",
      key: "tenVatPham",
      align: "center",
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
    {
      title: "Vị trí",
      dataIndex: "viTri",
      key: "viTri",
      align: "center",
    },
    {
      title: "SL điều chuyển",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Mô tả",
      dataIndex: "moTa",
      key: "moTa",
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

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(colValues, (col) => {
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

  const onFinish = (value) => {
    const newData = ListViTriKho.filter((data) => data.soLuong !== 0);
    setDataListVatPham([...DataListVatPham, ...newData]);
    setFieldsValue({
      themvattu: {
        tits_qtsx_CauTrucKhoBegin_Id: itemData.tits_qtsx_CauTrucKhoBegin_Id,
        tits_qtsx_VatPham_Id: null,
      },
    });
    setListViTriKho([]);
    const newListVatPham = ListVatPham.filter(
      (data) =>
        data.tits_qtsx_VatPham_Id !== value.themvattu.tits_qtsx_VatPham_Id
    );
    setFieldTouch(false);
    setListVatPham(newListVatPham);
  };

  const XacNhan = () => {
    DataThemVatTu(DataListVatPham);
    openModalFS(false);
    resetFields();
    setDataListVatPham([]);
  };

  const SelectViTriKho = (value) => {
    getListViTriKho(itemData.tits_qtsx_CauTrucKhoBegin_Id, value);
  };

  const handleCancel = () => {
    setListVatPham([]);
    setListViTriKho([]);
    setDataListVatPham([]);
    resetFields();
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
          <Form
            {...DEFAULT_FORM_THEMVATTU}
            form={form}
            name="nguoi-dung-control"
            onFinish={onFinish}
            onFieldsChange={() => setFieldTouch(true)}
          >
            <Row>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Kho điều chuyển"
                  name={["themvattu", "tits_qtsx_CauTrucKhoBegin_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListKhoVatTuDi ? ListKhoVatTuDi : []}
                    optionsvalue={["id", "tenCauTrucKho"]}
                    style={{ width: "100%" }}
                    placeholder="Kho điều chuyển"
                    showSearch
                    optionFilterProp={"name"}
                    disabled={true}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Vật tư"
                  name={["themvattu", "tits_qtsx_VatPham_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListVatPham}
                    placeholder="Chọn tên vật tư"
                    optionsvalue={["tits_qtsx_VatPham_Id", "vatPham"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    onSelect={SelectViTriKho}
                  />
                </FormItem>
              </Col>
            </Row>
            <Table
              bordered
              columns={columnsvitri}
              scroll={{ x: 1300, y: "55vh" }}
              components={components}
              className="gx-table-responsive"
              dataSource={reDataForTable(ListViTriKho)}
              size="small"
              rowClassName={"editable-row"}
              pagination={false}
            />
            <Row
              justify={"center"}
              style={{
                marginTop: 10,
              }}
            >
              <Button type="primary" htmlType={"submit"} disabled={!fieldTouch}>
                Thêm vật tư
              </Button>
            </Row>
          </Form>
          <Table
            bordered
            columns={columns}
            scroll={{ x: 1300, y: "55vh" }}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(DataListVatPham)}
            size="small"
            rowClassName={"editable-row"}
            pagination={false}
          />
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 10 }}
          >
            <Button
              className="th-btn-margin-bottom-0"
              type="primary"
              onClick={XacNhan}
              disabled={DataListVatPham.length === 0}
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
