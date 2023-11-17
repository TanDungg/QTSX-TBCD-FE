import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Card, Form, Input, Row, Col, Divider, Button } from "antd";
import { map } from "lodash";
import includes from "lodash/includes";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  EditableTableRow,
  FormSubmit,
  ModalDeleteConfirm,
  Select,
  Table,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";

const FormItem = Form.Item;
const { EditableRow, EditableCell } = EditableTableRow;

const initialState = {
  tenLot: "",
};
const SoLoForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListDonHang, setListDonHang] = useState([]);
  const [ListSanPham, setListSanPham] = useState([]);
  const [SoLuongSanPhamToiDa, setSoLuongSanPhamToiDa] = useState([]);

  const [ListSanPhamSelect, setListSanPhamSelect] = useState([]);
  const [DisableSoLuong, setDisableSoLuong] = useState(true);

  const [typeSanPham, setTypeSanPham] = useState("");

  const [infoSanPham, setInfoSanPham] = useState({});
  const [ActiveModal, setActiveModal] = useState(false);
  const [form] = Form.useForm();
  const { tenLot } = initialState;
  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getDonHang();
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else {
        if (permission && permission.edit) {
          setType("edit");
          // Get info
          const { id } = match.params;
          setId(id);
          getDonHang();
          getInfo();
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getDonHang = (id) => {
    const url = id
      ? `tits_qtsx_SoLo/don-hang-chua-du-so-lo?tits_qtsx_DonHang_Id=${id}`
      : `tits_qtsx_SoLo/don-hang-chua-du-so-lo`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "GET", null, "DETAIL", "", resolve, reject));
    })
      .then((res) => {
        if (res && res.data) {
          if (id) {
            const newData = [];
            res.data.forEach((dt) => {
              newData.push(...JSON.parse(dt.chiTiet_DonHangs));
            });
            setListSanPhamSelect(newData);
          } else {
            setListDonHang(res.data);
          }
        } else {
          if (id) {
            setListSanPhamSelect([]);
          } else {
            setListDonHang([]);
          }
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy thông tin
   *
   */
  const getInfo = () => {
    const { id } = match.params;
    setId(id);
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`Lot/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setFieldsValue({
            Lot: res.data,
          });
        }
        setInfo(res.data);
      })
      .catch((error) => console.error(error));
  };
  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "sản phẩm";
    ModalDeleteConfirm(deleteItemAction, item, item.tenSanPham, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const newData = ListSanPham.filter(
      (d) => d.tits_qtsx_ChiTiet !== item.tits_qtsx_ChiTiet
    );
    setListSanPham(newData);
  };
  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const editItemVal =
      type === "new" || type === "edit"
        ? {
            onClick: () => {
              setActiveModal(true);
              setInfoSanPham(item);
              setTypeSanPham("edit");
            },
          }
        : { disabled: true };
    const deleteItemVal =
      type === "new" || type === "edit"
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <React.Fragment>
          <a {...editItemVal} title="Xóa">
            <EditOutlined />
          </a>
          <Divider type="vertical" />
          <a {...deleteItemVal} title="Xóa">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };
  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
      align: "center",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
    },
    {
      title: "Mã loại sản phẩm",
      dataIndex: "maLoaiSanPham",
      key: "maLoaiSanPham",
      align: "center",
    },
    {
      title: "Màu sắc",
      dataIndex: "tenMauSac",
      key: "tenMauSac",
      align: "center",
    },
    {
      title: "Mã sản phẩm nội bộ",
      dataIndex: "maNoiBo",
      key: "maNoiBo",
      align: "center",
    },
    {
      title: "Quy trình",
      dataIndex: "maQuyTrinh",
      key: "maQuyTrinh",
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
  /**
   * Quay lại trang lot
   *
   */
  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${match.params.id}/chinh-sua`,
        ""
      )}`
    );
  };

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.Lot);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.Lot, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (user, saveQuit = false) => {
    if (type === "new") {
      const newData = user;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`Lot`, "POST", newData, "ADD", "", resolve, reject)
        );
      })
        .then((res) => {
          if (res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
            }
          } else {
            if (saveQuit) {
              goBack();
            } else {
              setFieldTouch(false);
            }
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = { ...info, ...user };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`Lot/${id}`, "PUT", newData, "EDIT", "", resolve, reject)
        );
      })
        .then((res) => {
          if (saveQuit) {
            if (res.status !== 409) goBack();
          } else {
            getInfo();
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };
  const validatePasswordsMatch = (_, value) => {
    if (value && value > SoLuongSanPhamToiDa) {
      return Promise.reject(
        new Error(`Số lượng phải nhỏ hơn ${SoLuongSanPhamToiDa}!`)
      );
    } else if (value && Number(value === 0)) {
      return Promise.reject(new Error(`Số lượng phải lớn hơn 0!`));
    }
    return Promise.resolve();
  };
  const formTitle = type === "new" ? "Thêm mới số lô" : "Chỉnh sửa số lô";
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_CUSTOM}
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
                label="Tên số lô"
                name={["Lot", "soLot"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                  {
                    max: 250,
                    message: "Số lot không được quá 250 ký tự",
                  },
                ]}
                initialValue={tenLot}
              >
                <Input className="input-item" placeholder="Nhập số lot" />
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
                label="Đơn hàng"
                name={["Lot", "tits_qtsx_DonHang_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListDonHang ? ListDonHang : []}
                  placeholder="Chọn đơn hàng"
                  optionsvalue={["id", "tenDonHang"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  onSelect={(val) => {
                    getDonHang(val);
                  }}
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
                label="Sản phẩm"
                name={["Lot", "tits_qtsx_SanPham_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListSanPhamSelect ? ListSanPhamSelect : []}
                  placeholder="Chọn sản phẩm"
                  optionsvalue={["tits_qtsx_SanPham_Id", "tenSanPham"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  onSelect={(val) => {
                    ListSanPhamSelect.forEach((sp) => {
                      if (val === sp.tits_qtsx_SanPham_Id) {
                        setSoLuongSanPhamToiDa(sp.soLuongConLai);
                        setDisableSoLuong(false);
                        setFieldsValue({
                          Lot: {
                            soLuong: sp.soLuongConLai,
                          },
                        });
                      }
                    });
                  }}
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
                name={["Lot", "soLuong"]}
                rules={[
                  {
                    required: true,
                  },
                  {
                    validator: validatePasswordsMatch,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Số lượng"
                  disabled={DisableSoLuong}
                />
              </FormItem>
            </Col>
            {(type === "new" || type === "edit") && (
              <Col span={24} align="end">
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => setActiveModal(true)}
                  type="primary"
                >
                  Thêm vào bảng
                </Button>
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => setActiveModal(true)}
                  type="primary"
                >
                  Import
                </Button>
              </Col>
            )}
          </Row>
        </Form>
      </Card>

      <Card
        title="Thông tin mã sản phẩm nội bộ"
        headStyle={{
          textAlign: "center",
          backgroundColor: "#0469B9",
          color: "#fff",
        }}
      >
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1300, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(ListSanPham)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          // loading={loading}
        />
      </Card>

      <FormSubmit
        goBack={goBack}
        handleSave={saveAndClose}
        saveAndClose={saveAndClose}
        disabled={fieldTouch}
      />
    </div>
  );
};

export default SoLoForm;
