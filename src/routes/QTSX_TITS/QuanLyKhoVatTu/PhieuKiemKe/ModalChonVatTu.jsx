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
  const [ListVatTuDefault, setListVatTuDefault] = useState([]);
  const [ListVatTu, setListVatTu] = useState([]);
  const [VatTu, setVatTu] = useState([]);
  const [DataListVatTu, setDataListVatTu] = useState([]);
  const [editingRecord, setEditingRecord] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListKho();
      setFieldsValue({
        themvattu: {
          tits_qtsx_CauTrucKho_Id: itemData.tits_qtsx_CauTrucKho_Id,
        },
      });
      getListViTriKho(itemData.tits_qtsx_CauTrucKho_Id);
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
          `tits_qtsx_CauTrucKho/cau-truc-kho-vat-tu-tree`,
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

  const getListViTriKho = (tits_qtsx_CauTrucKho_Id) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_CauTrucKho_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ViTriLuuKhoVatTu/vat-tu-by-kho?${params}`,
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
        const newData = res.data
          .map((data) => {
            const vatTu = `${data.maVatTu} - ${data.tenVatTu}`;
            return {
              ...data,
              vatTu: vatTu,
            };
          })
          .filter((data) => {
            return (
              itemData.DataListVatTu &&
              !itemData.DataListVatTu.some(
                (item) => item.tits_qtsx_VatTu_Id === data.tits_qtsx_VatTu_Id
              )
            );
          });
        setListVatTu(newData);
        setListVatTuDefault(newData);
      } else {
        setListVatTu([]);
        setListVatTuDefault([]);
      }
    });
  };

  const getVatTu = (tits_qtsx_VatTu_Id) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_VatTu_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ViTriLuuKhoVatTu/get-so-luong-ton-kho-vat-tu?${params}`,
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
        const newData = {
          ...res.data,
          soLuongTrongKho: res.data.soLuongTonKho,
          soLuongKiemKe: res.data.soLuongTonKho,
          danhGiaChatLuong: null,
          moTa: null,
        };
        setVatTu([newData]);
      }
    });
  };

  const handleInputChange = (val, item) => {
    const slKiemTra = val.target.value;
    if (isEmpty(slKiemTra) || Number(slKiemTra) <= 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message =
        "Số lượng điều chuyển phải lớn hơn hoặc bằng 0 và bắt buộc";
    } else {
      const newData = editingRecord.filter(
        (d) => d.tits_qtsx_VatTu_Id !== item.tits_qtsx_VatTu_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...VatTu];
    newData.forEach((ct, index) => {
      if (ct.tits_qtsx_VatTu_Id === item.tits_qtsx_VatTu_Id) {
        ct.soLuongKiemKe = slKiemTra;
      }
    });
    setListVatTu(newData);
  };

  const renderSoLuongKiemKe = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.tits_qtsx_VatTu_Id === item.tits_qtsx_VatTu_Id) {
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
          value={item.soLuongKiemKe}
          onChange={(val) => handleInputChange(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

  const handleInput = (value, item, key) => {
    const values = value.target.value;
    setFieldTouch(true);
    const newData = [...VatTu];
    newData.forEach((ct, index) => {
      if (
        ct.tits_qtsx_VatTu_Id === item.tits_qtsx_VatTu_Id &&
        key === "danhGiaChatLuong"
      ) {
        ct.danhGiaChatLuong = values;
      } else if (
        ct.tits_qtsx_VatTu_Id === item.tits_qtsx_VatTu_Id &&
        key === "moTa"
      ) {
        ct.moTa = values;
      }
    });
    setListVatTu(newData);
  };

  const renderInput = (item, key) => {
    return (
      <Input
        style={{
          textAlign: "center",
          width: "100%",
        }}
        className={`input-item`}
        value={item[key]}
        onChange={(val) => handleInput(val, item, key)}
      />
    );
  };

  let colValuesViTri = [
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
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
    {
      title: "SL trong kho",
      dataIndex: "soLuongTrongKho",
      key: "soLuongTrongKho",
      align: "center",
    },
    {
      title: "SL kiểm kê",
      key: "soLuongKiemKe",
      align: "center",
      render: (record) => renderSoLuongKiemKe(record),
    },
    {
      title: "Đánh giá",
      key: "danhGiaChatLuong",
      align: "center",
      render: (record) => renderInput(record, "danhGiaChatLuong"),
    },
    {
      title: "Ghi chú",
      key: "moTa",
      align: "center",
      render: (record) => renderInput(record, "moTa"),
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
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, "vật tư");
  };

  const deleteItemAction = (item) => {
    const newData = DataListVatTu.filter(
      (data) => data.tits_qtsx_VatTu_Id !== item.tits_qtsx_VatTu_Id
    );
    setDataListVatTu(newData);

    const newListVattu = ListVatTuDefault.filter(
      (data) => data.tits_qtsx_VatTu_Id === item.tits_qtsx_VatTu_Id
    );
    setListVatTu([...ListVatTu, ...newListVattu]);
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
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
    {
      title: "SL trong kho",
      dataIndex: "soLuongTrongKho",
      key: "soLuongTrongKho",
      align: "center",
    },
    {
      title: "SL kiểm kê",
      dataIndex: "soLuongKiemKe",
      key: "soLuongKiemKe",
      align: "center",
    },
    {
      title: "Đánh giá",
      dataIndex: "danhGiaChatLuong",
      key: "danhGiaChatLuong",
      align: "center",
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
    setDataListVatTu([...DataListVatTu, ...VatTu]);
    setFieldsValue({
      themvattu: {
        tits_qtsx_CauTrucKho_Id: itemData.tits_qtsx_CauTrucKho_Id,
        tits_qtsx_VatTu_Id: null,
      },
    });
    setVatTu([]);
    const newListVatTu = ListVatTu.filter(
      (data) => data.tits_qtsx_VatTu_Id !== value.themvattu.tits_qtsx_VatTu_Id
    );
    setListVatTu(newListVatTu);
    setFieldTouch(false);
  };

  const XacNhan = () => {
    DataThemVatTu(DataListVatTu);
    openModalFS(false);
    resetFields();
    setDataListVatTu([]);
  };

  const handleSelectVatTu = (value) => {
    getVatTu(value);
  };

  const handleCancel = () => {
    setListVatTu([]);
    setVatTu([]);
    setDataListVatTu([]);
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
                  name={["themvattu", "tits_qtsx_CauTrucKho_Id"]}
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
                  name={["themvattu", "tits_qtsx_VatTu_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListVatTu}
                    placeholder="Chọn tên vật tư"
                    optionsvalue={["tits_qtsx_VatTu_Id", "vatTu"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    onSelect={handleSelectVatTu}
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
              dataSource={VatTu}
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
            dataSource={reDataForTable(DataListVatTu)}
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
              disabled={DataListVatTu.length === 0}
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
