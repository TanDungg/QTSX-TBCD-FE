import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Card, Form, Input, Row, Col, Divider, Button } from "antd";
import { isEmpty, map } from "lodash";
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
import Helpers from "src/helpers";
import ModalAddVatTu from "./ModalAddVatTu";

const FormItem = Form.Item;
const { EditableRow, EditableCell } = EditableTableRow;

const initialState = {
  tenLot: "",
};
const BienBanBanGIaoForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListDonHang, setListDonHang] = useState([]);
  const [ListVatTu, setListVatTu] = useState([]);
  const [editingRecord, setEditingRecord] = useState([]);
  const [ListSanPham, setListSanPham] = useState([]);
  const [ActiveModal, setActiveModal] = useState(false);
  const [ListSoVin, setListSoVin] = useState([]);

  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue, getFieldValue } = form;

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
          getDonHang("", "", 1);
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
  const getDonHang = () => {
    const params = convertObjectToUrlParams({});
    const url = `tits_qtsx_SoLo/don-hang-chua-du-so-lo?${params}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "GET", null, "DETAIL", "", resolve, reject));
    })
      .then((res) => {
        if (res && res.data) {
          setListDonHang(res.data);
        } else {
          setListDonHang([]);
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
        fetchStart(
          `tits_qtsx_SoLo/${id}`,
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
          setListVatTu(JSON.parse(res.data.list_DoRois));
          setFieldsValue({
            khaibaosocontainer: {
              ...res.data,
              list_ChiTiets: JSON.parse(res.data.list_ChiTiets).map(
                (ct) => ct.tits_qtsx_SoVin_Id
              ),
            },
          });
        }
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
    const title = "vật tư";
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const newData = ListVatTu.filter((d) => d.key !== item.key);
    setListVatTu(newData);
  };
  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    // const editItemVal =
    //   type === "new" || type === "edit"
    //     ? {
    //         onClick: () => {
    //           setInfoSanPham(item);
    //         },
    //       }
    //     : { disabled: true };
    const deleteItemVal =
      type === "new" || type === "edit"
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <React.Fragment>
          {/* <a {...editItemVal} title="Xóa">
            <EditOutlined />
          </a>
          <Divider type="vertical" /> */}
          <a {...deleteItemVal} title="Xóa">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };
  const handleInputChange = (val, item) => {
    const soLuongNhap = val.target.value;
    if (isEmpty(soLuongNhap) || Number(soLuongNhap) <= 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else {
      const newData = editingRecord.filter(
        (d) => d.tits_qtsx_VatTu_Id !== item.tits_qtsx_VatTu_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...ListVatTu];
    newData.forEach((ct, index) => {
      if (ct.tits_qtsx_VatTu_Id === item.tits_qtsx_VatTu_Id) {
        ct.soLuong = soLuongNhap;
      }
    });
    setListVatTu(newData);
  };

  const rendersoLuong = (item) => {
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
          }}
          className={`input-item`}
          type="number"
          value={item.soLuong}
          disabled={
            type === "new" || type === "edit" || type === "duyet" ? false : true
          }
          onChange={(val) => handleInputChange(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
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
      title: "Số lượng",
      key: "soLuong",
      align: "center",
      render: (val) => rendersoLuong(val),
    },
    // {
    //   title: "Quy trình",
    //   dataIndex: "tenQuyTrinhSanXuat",
    //   key: "tenQuyTrinhSanXuat",
    //   align: "center",
    // },
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
    saveData(values.khaibaosocontainer);
  };

  const saveAndClose = (value) => {
    validateFields()
      .then((values) => {
        saveData(values.khaibaosocontainer, value);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (user, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...user,
        list_ChiTiets: user.list_ChiTiets.map((ct) => {
          return {
            tits_qtsx_SoVin_Id: ct,
          };
        }),
        list_DoRois: ListVatTu,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_SoLo`,
            "POST",
            newData,
            "ADD",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
              setListVatTu([]);
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
      const newData = {
        ...user,
        list_ChiTiets: user.list_ChiTiets.map((ct) => {
          return {
            tits_qtsx_SoVin_Id: ct,
          };
        }),
        list_DoRois: ListVatTu,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_SoLo/${id}`,
            "PUT",
            newData,
            "EDIT",
            "",
            resolve,
            reject
          )
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

  const formTitle = type === "new" ? "Thêm mới Cont" : "Chỉnh sửa Cont";
  const onClickAddTable = () => {
    setActiveModal(true);
  };

  const addSanPham = (data) => {
    setListVatTu([...ListVatTu, data]);
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin số lô"}
        headStyle={{
          textAlign: "center",
          backgroundColor: "#0469B9",
          color: "#fff",
        }}
      >
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
                label="Số container"
                name={["khaibaosocontainer", "soContainer"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                  {
                    max: 250,
                  },
                ]}
              >
                <Input className="input-item" placeholder="Nhập số container" />
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
                label="Số seal"
                name={["khaibaosocontainer", "soSeal"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                  {
                    max: 250,
                  },
                ]}
              >
                <Input className="input-item" placeholder="Nhập số seal" />
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
                label="Dimensions"
                name={["khaibaosocontainer", "dimensions"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                  {
                    max: 250,
                  },
                ]}
              >
                <Input className="input-item" placeholder="Nhập dimensions" />
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
                name={["khaibaosocontainer", "tits_qtsx_DonHang_Id"]}
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
                name={["khaibaosocontainer", "tits_qtsx_DonHangChiTiet_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListSanPham ? ListSanPham : []}
                  placeholder="Chọn sản phẩm"
                  optionsvalue={["tits_qtsx_DonHangChiTiet_Id", "name"]}
                  style={{ width: "100%" }}
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
                label="List số VIN"
                name={["khaibaosocontainer", "list_ChiTiets"]}
                rules={[
                  {
                    type: "array",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListSoVin ? ListSoVin : []}
                  placeholder="Chọn số VIN"
                  optionsvalue={["id", "tenSoLo"]}
                  style={{ width: "100%" }}
                  mode={"multiple"}
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
                label="Ghi chú"
                name={["khaibaosocontainer", "moTa"]}
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
        </Form>
      </Card>

      <Card
        title="Thông tin checklist đồ rời"
        headStyle={{
          textAlign: "center",
          backgroundColor: "#0469B9",
          color: "#fff",
        }}
      >
        {(type === "new" || type === "edit") && (
          <Col
            // xxl={12}
            // xl={12}
            // lg={24}
            // md={24}
            // sm={24}
            // xs={24}
            // style={{ marginBottom: 8 }}
            span={24}
            align="end"
          >
            <Button
              icon={<PlusOutlined />}
              onClick={onClickAddTable}
              type="primary"
            >
              Thêm vật tư
            </Button>
            {/* {type === "new" && (
              <Button
                icon={<UploadOutlined />}
                onClick={() => setActiveModal(true)}
                type="primary"
                disabled={DisableAdd}
              >
                Import
              </Button>
            )} */}
          </Col>
        )}
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1300, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(ListVatTu)}
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
      <ModalAddVatTu
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        addSanPham={addSanPham}
        listVT={ListVatTu}
      />
    </div>
  );
};

export default BienBanBanGIaoForm;
