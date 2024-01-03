import { Modal as AntModal, Card, Input, Button, Row, Col, Form } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { reDataForTable } from "src/util/Common";
import { ModalDeleteConfirm, Select, Table } from "src/components/Common";
import { DeleteOutlined } from "@ant-design/icons";
import { DEFAULT_FORM_THEMVATTU } from "src/constants/Config";
import Helpers from "src/helpers";

const FormItem = Form.Item;

function ModalChonThanhPham({
  openModalFS,
  openModal,
  itemData,
  ThemThanhPham,
}) {
  const { width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  const [ListThanhPham, setListThanhPham] = useState([]);
  const [ThanhPham, setThanhPham] = useState(null);
  const [ListDataThanhPham, setListDataThanhPham] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListThanhPhamChuaNhapKho();
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListThanhPhamChuaNhapKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuNhapKhoThanhPham/thanh-pham-nhap-kho`,
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
        if (itemData) {
          const newListThanhPham = res.data.map((data) => {
            const thanhpham = `${data.tenSanPham}${
              data.tenMauSac ? ` (${data.tenMauSac})` : ""
            }`;
            return {
              ...data,
              soLuongChuaNhap: data.soLuong,
              thanhPham: thanhpham,
            };
          });
          const newData = newListThanhPham.filter((data) => {
            if (itemData.length > 0) {
              return !itemData.some(
                (item) => item.thanhPham === data.thanhPham
              );
            } else {
              return true;
            }
          });
          setListThanhPham(newData);
        } else {
          const newData = res.data.map((data) => {
            return {
              ...data,
              soLuongChuaNhap: data.soLuong,
              thanhPham: `${data.tenSanPham}${
                data.tenMauSac ? ` (${data.tenMauSac})` : ""
              }`,
            };
          });
          setListThanhPham(newData);
        }
      } else {
        setListThanhPham([]);
      }
    });
  };

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
    ModalDeleteConfirm(deleteItemAction, item, item.thanhPham, "thành phẩm");
  };

  const deleteItemAction = (item) => {
    const newData = ListDataThanhPham.filter(
      (data) => data.thanhPham !== item.thanhPham
    );
    setListDataThanhPham(newData);

    const newDataListThanhPham = ListDataThanhPham.filter(
      (data) => data.thanhPham === item.thanhPham
    ).map((tp) => {
      return {
        ...tp,
        soLuong: tp.soLuongChuaNhap,
      };
    });
    setListThanhPham([...ListThanhPham, ...newDataListThanhPham]);
  };

  let colListThanhPham = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
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
    },
    {
      title: "Số lượng nhập",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Màu sắc",
      dataIndex: "tenMauSac",
      key: "tenMauSac",
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

  const onFinish = (value) => {
    const data = value.modalchonthanhpham;
    if (Number(data.soLuong) > Number(ThanhPham.soLuong)) {
      Helpers.alertError("Số lượng nhập không được lớn hơn số lượng chưa nhập");
    } else if (Number(data.soLuong) <= 0) {
      Helpers.alertError("Số lượng nhập không được nhỏ hơn hoặc bằng 0");
    } else {
      const newListThanhPham = ListThanhPham.filter(
        (tp) => tp.thanhPham !== ThanhPham.thanhPham
      );
      setListThanhPham(newListThanhPham);

      const newData = { ...data, ...ThanhPham, soLuong: data.soLuong };
      setListDataThanhPham([...ListDataThanhPham, newData]);
      setThanhPham(null);
      resetFields();
    }
    setFieldTouch(false);
  };

  const XacNhan = () => {
    ThemThanhPham(ListDataThanhPham);
    setListThanhPham([]);
    setListDataThanhPham([]);
    setThanhPham(null);
    openModalFS(false);
  };

  const handleSelectThanhPham = (value) => {
    const thanhpham = ListThanhPham.filter((tp) => tp.thanhPham === value);
    setThanhPham(thanhpham[0]);
    setFieldsValue({
      modalchonthanhpham: {
        soLuong: thanhpham[0].soLuong,
      },
    });
  };

  const handleCancel = () => {
    setListThanhPham([]);
    setListDataThanhPham([]);
    setThanhPham([]);
    setThanhPham(null);
    openModalFS(false);
  };

  return (
    <AntModal
      title={`Chọn thành phẩm nhập kho`}
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
            <Row justify={"center"}>
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
                  name={["modalchonthanhpham", "tits_qtsx_ThanhPham_Id"]}
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
                    placeholder="Chọn xưởng sản xuất"
                    optionsvalue={["thanhPham", "thanhPham"]}
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
                  label="Màu sắc"
                  name={["modalchonthanhpham", "tits_qtsx_ThanhPham_Id"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListThanhPham}
                    placeholder="Chọn màu sắc"
                    optionsvalue={["thanhPham", "tenMauSac"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
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
                  label="Số lượng"
                  name={["modalchonthanhpham", "soLuong"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input placeholder="Nhập số lượng nhập kho" type="number" />
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
                  name={["modalchonthanhpham", "moTa"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input placeholder="Nhập ghi chú" />
                </FormItem>
              </Col>
            </Row>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button type="primary" htmlType={"submit"} disabled={!fieldTouch}>
                Thêm
              </Button>
            </div>
          </Form>
          <Table
            bordered
            columns={colListThanhPham}
            scroll={{ x: 800, y: "25vh" }}
            className="gx-table-responsive"
            dataSource={reDataForTable(ListDataThanhPham)}
            size="small"
            pagination={false}
          />
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 10 }}
          >
            <Button
              className="th-btn-margin-bottom-0"
              type="primary"
              onClick={XacNhan}
              disabled={ListDataThanhPham.length === 0}
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
