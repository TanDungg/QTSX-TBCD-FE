import { DeleteOutlined } from "@ant-design/icons";
import {
  Modal as AntModal,
  Form,
  Input,
  Row,
  Button,
  Col,
  Card,
  Tag,
} from "antd";
import { isEmpty, map } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Select,
  Table,
} from "src/components/Common";
import { DEFAULT_FORM_THEMVATTU } from "src/constants/Config";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";

const FormItem = Form.Item;
const { EditableRow, EditableCell } = EditableTableRow;

function ModalThemThanhPham({
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
  const [DataListThanhPham, setDataListThanhPham] = useState([]);
  const [ListThanhPham, setListThanhPham] = useState([]);
  const [ThanhPham, setThanhPham] = useState({});
  const [ListSoLo, setListSoLo] = useState([]);
  const [DisabledSave, setDisabledSave] = useState(true);
  const [editingRecord, setEditingRecord] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListThanhPham(itemData.tits_qtsx_CauTrucKho_Id);
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListThanhPham = (tits_qtsx_CauTrucKho_Id) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_CauTrucKho_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ViTriLuuKhoThanhPham/thanh-pham-by-kho-khong-mau?${param}`,
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
        const newListThanhPham = res.data.map((data) => {
          const thanhpham = `${data.maSanPham} - ${data.tenSanPham}`;
          return {
            ...data,
            soLuong: data.soLuongTon,
            thanhPham: thanhpham,
          };
        });
        const newData = newListThanhPham.filter((data) => {
          if (itemData && itemData.ListThanhPham.length !== 0) {
            return (
              itemData &&
              !itemData.ListThanhPham.some(
                (item) =>
                  item.tits_qtsx_ThanhPham_Id.toLowerCase() ===
                  data.tits_qtsx_ThanhPham_Id.toLowerCase()
              )
            );
          } else {
            return true;
          }
        });
        setListThanhPham(newData);
      }
    });
  };

  const getListSoLo = (tits_qtsx_ThanhPham_Id) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_ThanhPham_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuKiemKeThanhPham/so-lo-chi-tiet-chua-xuat?${param}`,
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
        setListSoLo(res.data);
      }
    });
  };

  const handleInputChange = (val, item) => {
    const soLuongKiemKe = val.target.value;
    if (isEmpty(soLuongKiemKe) || Number(soLuongKiemKe) < 0) {
      setDisabledSave(true);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng kiểm kê phải là số lớn hơn hoặc và bắt buộc";
    } else {
      const newData =
        editingRecord &&
        editingRecord.filter(
          (d) =>
            d.tits_qtsx_ThanhPham_Id.toLowerCase() !==
            item.tits_qtsx_ThanhPham_Id.toLowerCase()
        );
      setDisabledSave(false);
      setEditingRecord(newData);
    }
    const newData = [...DataListThanhPham];

    newData.forEach((ct, index) => {
      if (
        ct.tits_qtsx_ThanhPham_Id.toLowerCase() ===
        item.tits_qtsx_ThanhPham_Id.toLowerCase()
      ) {
        ct.soLuong = soLuongKiemKe;
      }
    });
    setDataListThanhPham(newData);
  };

  const renderSoLuongKiemKe = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord &&
      editingRecord.forEach((ct) => {
        if (
          ct.tits_qtsx_ThanhPham_Id.toLowerCase() ===
          item.tits_qtsx_ThanhPham_Id.toLowerCase()
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

  const deleteItemFunc = (item) => {
    const title = "thành phẩm";
    ModalDeleteConfirm(deleteItemAction, item, item.tenSanPham, title);
  };

  const deleteItemAction = (item) => {
    const newData = DataListThanhPham.filter(
      (d) => d.thanhPham !== item.thanhPham
    );
    setDataListThanhPham(newData);

    const thanhpham = DataListThanhPham.filter(
      (d) => d.thanhPham === item.thanhPham
    ).map((tp) => {
      return {
        ...tp,
        soLuong: tp.soLuongTon,
      };
    });
    setListThanhPham([...ListThanhPham, thanhpham[0]]);
  };

  const actionContent = (item) => {
    const deleteItemVal = { onClick: () => deleteItemFunc(item) };

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

  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Mã thành phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
    },
    {
      title: "Tên thành phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
      width: 100,
    },
    {
      title: "SL tồn kho",
      dataIndex: "soLuongTon",
      key: "soLuongTon",
      align: "center",
    },
    {
      title: "SL kiểm kê",
      key: "soLuong",
      align: "center",
      render: (record) => renderSoLuongKiemKe(record),
    },
    {
      title: "Đánh giá",
      dataIndex: "danhGia",
      key: "danhGia",
      align: "center",
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
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

  const onFinish = (values) => {
    const data = values.themthanhpham;

    const newData = {
      ...data,
      ...ThanhPham,
      soLuong: data.soLuong,
    };
    setDataListThanhPham([...DataListThanhPham, newData]);
    setDisabledSave(false);

    const listthanhpham = ListThanhPham.filter(
      (d) => d.tits_qtsx_ThanhPham_Id !== ThanhPham.tits_qtsx_ThanhPham_Id
    );
    setListThanhPham(listthanhpham);
    setThanhPham({});
    setFieldTouch(false);
    resetFields();
  };

  const XacNhan = () => {
    DataThemThanhPham(DataListThanhPham);
    setDisabledSave(true);
    openModalFS(false);
    setListThanhPham([]);
    setDataListThanhPham([]);
  };

  const handleSelectThanhPham = (value) => {
    const thanhpham = ListThanhPham.filter(
      (vt) => vt.tits_qtsx_ThanhPham_Id === value
    );
    setThanhPham(thanhpham[0]);
    setFieldsValue({
      themthanhpham: {
        soLuongTon: thanhpham[0].soLuongTon,
        soLuong: thanhpham[0].soLuong,
      },
    });
    getListSoLo(value);
  };

  const handleCancel = () => {
    openModalFS(false);
    setThanhPham({});
    setListThanhPham([]);
    setDataListThanhPham([]);
  };

  return (
    <AntModal
      title="Thêm danh sách thành phẩm"
      open={openModal}
      width={width > 1200 ? `85%` : `90%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <div className="gx-main-content">
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
                    placeholder="Chọn thành phẩm"
                    optionsvalue={["tits_qtsx_ThanhPham_Id", "thanhPham"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    onSelect={handleSelectThanhPham}
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
                  label="Số lô"
                  name={["themthanhpham", "tits_qtsx_SoLoChiTiet_Id"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListSoLo}
                    placeholder="Chọn số lô"
                    optionsvalue={["tits_qtsx_SoLo_Id", "tenSoLo"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
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
                  label="SL tồn kho"
                  name={["themthanhpham", "soLuongTon"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    type="number"
                    className="input-item"
                    placeholder="Số lượng tồn kho"
                    disabled
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
                  label="SL kiểm kê"
                  name={["themthanhpham", "soLuong"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    type="number"
                    className="input-item"
                    placeholder="Số lượng kiểm kê"
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
                  label="Đánh giá"
                  name={["themthanhpham", "danhGia"]}
                  rules={[
                    {
                      required: true,
                      type: "string",
                    },
                  ]}
                >
                  <Input className="input-item" placeholder="Nhập đánh giá" />
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
                  label="Ghi chú"
                  name={["themthanhpham", "moTa"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input className="input-item" placeholder="Nhập ghi chú" />
                </FormItem>
              </Col>
            </Row>
            <Row justify={"center"} style={{ marginTop: 15 }}>
              <Button type="primary" htmlType={"submit"} disabled={!fieldTouch}>
                Thêm thành phẩm
              </Button>
            </Row>
          </Form>
        </div>

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

        <Row justify={"center"} style={{ marginTop: 15 }}>
          <Button type="primary" onClick={XacNhan} disabled={DisabledSave}>
            Xác nhận
          </Button>
        </Row>
      </Card>
    </AntModal>
  );
}

export default ModalThemThanhPham;
