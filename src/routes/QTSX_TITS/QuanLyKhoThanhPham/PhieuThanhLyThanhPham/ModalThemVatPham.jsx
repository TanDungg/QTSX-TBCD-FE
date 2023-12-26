import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  Modal as AntModal,
  Form,
  Input,
  Row,
  Button,
  Col,
  Card,
  Tag,
  Divider,
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
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";

const FormItem = Form.Item;
const { EditableRow, EditableCell } = EditableTableRow;

function ModalThemVatPham({
  openModalFS,
  openModal,
  DataThemVatPham,
  itemData,
}) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  const [DataListVatPham, setDataListVatPham] = useState([]);
  const [ListVatPham, setListVatPham] = useState([]);
  const [VatPham, setVatPham] = useState([]);
  const [ListViTriKho, setListViTriKho] = useState([]);
  const [editingRecord, setEditingRecord] = useState([]);
  const [SelectedViTri, setSelectedViTri] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListViTriVatPham(itemData.tits_qtsx_CauTrucKho_Id);
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListViTriVatPham = (
    tits_qtsx_CauTrucKho_Id,
    tits_qtsx_VatPham_Id,
    tits_qtsx_MauSac_Id
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_CauTrucKho_Id,
      tits_qtsx_VatPham_Id,
      tits_qtsx_MauSac_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ViTriLuuKhoThanhPham/vat-pham-by-kho?${param}`,
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
        if (!tits_qtsx_VatPham_Id) {
          const newListVatPham = res.data.map((data) => {
            const thanhpham = `${data.tenVatPham}${
              data.tenMauSac ? ` (${data.tenMauSac})` : ""
            }`;
            return {
              ...data,
              thanhPham: thanhpham,
            };
          });
          const newData = newListVatPham.filter((data) => {
            if (itemData.ListVatPham.length > 0) {
              return !itemData.ListVatPham.some(
                (item) => item.thanhPham === data.thanhPham
              );
            } else {
              return true;
            }
          });
          setListVatPham(newData);
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
    const soLuongXuat = val.target.value;
    if (isEmpty(soLuongXuat) || Number(soLuongXuat) <= 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else if (soLuongXuat > item.soLuongTonKho) {
      setFieldTouch(false);
      item.message = `Số lượng xuất không được lớn hơn ${item.soLuongTonKho}`;
      setEditingRecord([...editingRecord, item]);
    } else {
      const newData =
        editingRecord &&
        editingRecord.filter(
          (d) =>
            d.tits_qtsx_ChiTietKhoVatTu_Id !== item.tits_qtsx_ChiTietKhoVatTu_Id
        );
      if (newData.length !== 0) {
        setFieldTouch(false);
      } else if (SelectedViTri.length === 0) {
        setFieldTouch(false);
      } else {
        setFieldTouch(true);
      }
      setEditingRecord(newData);
    }
    const newData = [...ListViTriKho];

    newData.forEach((ct, index) => {
      if (
        ct.tits_qtsx_ChiTietKhoVatTu_Id === item.tits_qtsx_ChiTietKhoVatTu_Id
      ) {
        ct.soLuong = soLuongXuat;
      }
    });
    setListViTriKho(newData);

    const newSelect = [...SelectedViTri];
    newSelect.forEach((ct, index) => {
      if (
        ct.tits_qtsx_ChiTietKhoVatTu_Id === item.tits_qtsx_ChiTietKhoVatTu_Id
      ) {
        ct.soLuong = soLuongXuat;
      }
    });
    setSelectedViTri(newSelect);
  };

  const renderSoLuongXuat = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord &&
      editingRecord.forEach((ct) => {
        if (
          ct.tits_qtsx_ChiTietKhoVatTu_Id === item.tits_qtsx_ChiTietKhoVatTu_Id
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

  let colListViTri = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Tên kho",
      dataIndex: "tenKho",
      key: "tenKho",
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
      title: "Số lượng tồn kho",
      dataIndex: "soLuongTonKho",
      key: "soLuongTonKho",
      align: "center",
    },
    {
      title: "Số lượng xuất",
      key: "soLuong",
      align: "center",
      render: (record) => renderSoLuongXuat(record),
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
  ];

  const deleteItemFunc = (item) => {
    const title = "thành phẩm";
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatPham, title);
  };

  const deleteItemAction = (item) => {
    const newData = DataListVatPham.filter(
      (d) => d.thanhPham !== item.thanhPham
    );
    setDataListVatPham(newData);

    const vattu = DataListVatPham.filter((d) => d.thanhPham === item.thanhPham);
    setListVatPham([...ListVatPham, vattu[0]]);
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

  const renderLstViTri = (record) => {
    return (
      <div>
        {record.list_ChiTietLuuKhos.map((vt, index) => {
          if (!vt.viTri) {
            if (index === 0) {
              return (
                <Tag
                  key={index}
                  color={"blue"}
                  style={{
                    marginRight: 5,
                    marginBottom: 3,
                    fontSize: 14,
                  }}
                >
                  {`${vt.tenKho} (SL: ${vt.soLuong})`}
                </Tag>
              );
            } else {
              return null;
            }
          } else {
            return (
              <Tag
                key={index}
                color={"blue"}
                style={{
                  marginRight: 5,
                  marginBottom: 3,
                  fontSize: 14,
                  wordWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {`${vt.viTri} (SL: ${vt.soLuong})`}
              </Tag>
            );
          }
        })}
      </div>
    );
  };

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Tên thành phẩm",
      dataIndex: "tenVatPham",
      key: "tenVatPham",
      align: "center",
    },
    {
      title: "Màu sắc",
      dataIndex: "tenMauSac",
      key: "tenMauSac",
      align: "center",
    },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      width: 100,
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
      width: 100,
    },
    {
      title: "SL thanh lý",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
      width: 100,
    },
    {
      title: "Vị trí",
      key: "list_ChiTietLuuKhos",
      align: "center",
      render: (record) => renderLstViTri(record),
    },
    {
      title: "Đề xuất",
      dataIndex: "deXuat",
      key: "deXuat",
      align: "center",
    },
    {
      title: "Nguyên nhân",
      dataIndex: "nguyenNhan",
      key: "nguyenNhan",
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

  const onFinish = (values) => {
    const data = values.themvatpham;
    const thanhpham = ListVatPham.filter(
      (d) => d.thanhPham === VatPham.thanhPham
    );

    const tong =
      SelectedViTri &&
      SelectedViTri.reduce(
        (tong, vitri) => tong + Number(vitri.soLuong || 0),
        0
      );

    const newData = {
      ...data,
      ...thanhpham[0],
      soLuong: tong,
      list_ChiTietLuuKhos: SelectedViTri,
    };

    setDataListVatPham([...DataListVatPham, newData]);

    const listthanhpham = ListVatPham.filter(
      (d) => d.thanhPham !== VatPham.thanhPham
    );
    setListVatPham(listthanhpham);
    resetFields();
    setFieldTouch(false);
    setListViTriKho([]);
  };

  const XacNhan = () => {
    DataThemVatPham(DataListVatPham);
    openModalFS(false);
    setListVatPham([]);
    setDataListVatPham([]);
  };

  const handleSelectViTri = (value) => {
    const thanhpham = ListVatPham.filter((vt) => vt.thanhPham === value);
    setVatPham(thanhpham[0]);
    getListViTriVatPham(
      itemData.tits_qtsx_CauTrucKho_Id,
      thanhpham.length ? thanhpham[0].tits_qtsx_VatPham_Id : null,
      thanhpham.length ? thanhpham[0].tits_qtsx_MauSac_Id : null
    );
    setSelectedViTri([]);
    setSelectedKeys([]);
  };

  const handleCancel = () => {
    openModalFS(false);
  };

  const rowSelection = {
    selectedRowKeys: SelectedKeys,
    selectedRows: SelectedViTri,
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedViTri = [...selectedRows];
      const newSelectedKeys = [...selectedRowKeys];
      if (newSelectedViTri.length === 0) {
        setFieldTouch(false);
      } else {
        setFieldTouch(true);
      }
      setSelectedViTri(newSelectedViTri);
      setSelectedKeys(newSelectedKeys);
    },
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
                  name={["themvatpham", "tits_qtsx_VatPham_Id"]}
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
                    placeholder="Chọn tên thành phẩm"
                    optionsvalue={["thanhPham", "thanhPham"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    onSelect={handleSelectViTri}
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
                  label="Hình ảnh"
                  name={["themvatpham", "hinhAnh"]}
                  rules={[
                    {
                      required: true,
                      type: "string",
                    },
                  ]}
                >
                  <Input className="input-item" placeholder="Nhập ghi chú" />
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
                  label="Đề xuất"
                  name={["themvatpham", "deXuat"]}
                  rules={[
                    {
                      required: true,
                      type: "string",
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập đề xuất thanh lý"
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
                  label="Nguyên nhân"
                  name={["themvatpham", "nguyenNhan"]}
                  rules={[
                    {
                      required: true,
                      type: "string",
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập nguyên nhân thanh lý"
                  />
                </FormItem>
              </Col>
            </Row>
            <Table
              bordered
              columns={colListViTri}
              scroll={{ x: 1000, y: "45vh" }}
              className="gx-table-responsive"
              dataSource={reDataForTable(ListViTriKho)}
              size="small"
              pagination={false}
              rowSelection={{
                type: "checkbox",
                ...rowSelection,
                preserveSelectedRowKeys: true,
                selectedRowKeys: SelectedKeys,
              }}
            />
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
          dataSource={reDataForTable(DataListVatPham)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
        />

        <Row justify={"center"} style={{ marginTop: 15 }}>
          <Button
            type="primary"
            onClick={XacNhan}
            disabled={DataListVatPham.length === 0}
          >
            Xác nhận
          </Button>
        </Row>
      </Card>
    </AntModal>
  );
}

export default ModalThemVatPham;
