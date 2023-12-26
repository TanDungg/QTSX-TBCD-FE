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

function ModalChonThanhPham({
  openModalFS,
  openModal,
  itemData,
  DataThemThanhPham,
}) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  const [ListKhoThanhPhamDi, setListKhoThanhPhamDi] = useState([]);
  const [ListThanhPham, setListThanhPham] = useState([]);
  const [ListViTriKho, setListViTriKho] = useState([]);
  const [DataListThanhPham, setDataListThanhPham] = useState([]);
  const [editingRecord, setEditingRecord] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListKho();
      setFieldsValue({
        themthanhpham: {
          tits_qtsx_CauTrucKhoBegin_Id: itemData.tits_qtsx_CauTrucKhoBegin_Id,
        },
      });
      getListViTriThanhPham(itemData.tits_qtsx_CauTrucKhoBegin_Id);
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
          `tits_qtsx_CauTrucKho/cau-truc-kho-by-thu-tu?thutu=1&&isThanhPham=true`,
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
          setListKhoThanhPhamDi(res.data);
        } else {
          setListKhoThanhPhamDi([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListViTriThanhPham = (
    tits_qtsx_CauTrucKho_Id,
    tits_qtsx_ThanhPham_Id,
    tits_qtsx_MauSac_Id
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_CauTrucKho_Id,
      tits_qtsx_ThanhPham_Id,
      tits_qtsx_MauSac_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ViTriLuuKhoThanhPham/thanh-pham-by-kho?${param}`,
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
        if (!tits_qtsx_ThanhPham_Id) {
          const newListThanhPham = res.data.map((data) => {
            const thanhpham = `${data.tenSanPham}${
              data.mauSac ? data.mauSac : ""
            }`;
            return {
              ...data,
              thanhPham: thanhpham,
            };
          });
          const newData = newListThanhPham.filter((data) => {
            if (itemData.ListThanhPham.length > 0) {
              return !itemData.ListThanhPham.some(
                (item) =>
                  item.tits_qtsx_ThanhPham_Id.toLowerCase() ===
                  data.tits_qtsx_ThanhPham_Id.toLowerCase()
              );
            } else {
              return true;
            }
          });
          setListThanhPham(newData);
        } else {
          const newData = res.data.map((data) => {
            const vitri = `${data.maKe ? `${data.maKe}` : ""}${
              data.maTang ? ` - ${data.maTang}` : ""
            }${data.maNgan ? ` - ${data.maNgan}` : ""}`;
            return {
              ...data,
              viTri: vitri ? vitri : null,
              soLuong: data.soLuongTonKho,
            };
          });
          setListViTriKho(newData);
        }
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
    setListThanhPham(newData);
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
    setListThanhPham(newData);
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
      title: "Mã thành phẩm",
      dataIndex: "maThanhPham",
      key: "maThanhPham",
      align: "center",
    },
    {
      title: "Tên thành phẩm",
      dataIndex: "tenThanhPham",
      key: "tenThanhPham",
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
    ModalDeleteConfirm(deleteItemAction, item, item.tenThanhPham, "thành phẩm");
  };

  const deleteItemAction = (item) => {
    const newData = ListThanhPham.filter(
      (data) =>
        data.tits_qtsx_ChiTietKhoBegin_Id !== item.tits_qtsx_ChiTietKhoBegin_Id
    );
    setListThanhPham(newData);
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
      title: "Mã thành phẩm",
      dataIndex: "maThanhPham",
      key: "maThanhPham",
      align: "center",
    },
    {
      title: "Tên thành phẩm",
      dataIndex: "tenThanhPham",
      key: "tenThanhPham",
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
    setDataListThanhPham([...DataListThanhPham, ...newData]);
    setFieldsValue({
      themthanhpham: {
        tits_qtsx_CauTrucKhoBegin_Id: itemData.tits_qtsx_CauTrucKhoBegin_Id,
        tits_qtsx_ThanhPham_Id: null,
      },
    });
    setListViTriKho([]);
    const newListThanhPham = ListThanhPham.filter(
      (data) =>
        data.tits_qtsx_ThanhPham_Id !==
        value.themthanhpham.tits_qtsx_ThanhPham_Id
    );
    setFieldTouch(false);
    setListThanhPham(newListThanhPham);
  };

  const XacNhan = () => {
    DataThemThanhPham(DataListThanhPham);
    openModalFS(false);
    resetFields();
    setDataListThanhPham([]);
  };

  const SelectViTriKho = (value) => {
    getListViTriThanhPham(itemData.tits_qtsx_CauTrucKhoBegin_Id, value);
  };

  const handleCancel = () => {
    setListThanhPham([]);
    setListViTriKho([]);
    setDataListThanhPham([]);
    resetFields();
    openModalFS(false);
  };

  return (
    <AntModal
      title={`Chọn thành phẩm điều chuyển`}
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
                  name={["themthanhpham", "tits_qtsx_CauTrucKhoBegin_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListKhoThanhPhamDi ? ListKhoThanhPhamDi : []}
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
                  label="Thành phẩm"
                  name={["themthanhpham", "tits_qtsx_ThanhPham_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListThanhPham}
                    placeholder="Chọn tên thành phẩm"
                    optionsvalue={["tits_qtsx_ThanhPham_Id", "ThanhPham"]}
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
                Thêm thành phẩm
              </Button>
            </Row>
          </Form>
          <Table
            bordered
            columns={columns}
            scroll={{ x: 1300, y: "55vh" }}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(DataListThanhPham)}
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
              disabled={DataListThanhPham.length === 0}
            >
              Xác nhận
            </Button>
          </div>
        </Card>
      </div>
    </AntModal>
  );
}

export default ModalChonThanhPham;
