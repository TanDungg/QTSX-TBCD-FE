import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Card, Form, Input, Row, Col, Button, Tag } from "antd";
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
import { DEFAULT_FORM, SMRM_BANGIAO } from "src/constants/Config";
import { getLocalStorage, getTokenInfo, reDataForTable } from "src/util/Common";
import ModalAddVatTu from "./ModalAddVatTu";

const FormItem = Form.Item;
const { EditableRow, EditableCell } = EditableTableRow;

const BienBanBanGIaoForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };

  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListKhachHang, setListKhachHang] = useState([]);
  const [ListVatTu, setListVatTu] = useState([]);
  // const [editingRecord, setEditingRecord] = useState([]);
  const [ListGiaoHang, setListGiaoHang] = useState([]);
  const [ActiveModal, setActiveModal] = useState(false);
  const [ListUser, setListUser] = useState([]);

  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getKhachHang();
          getUser(INFO);
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else {
        if (permission && permission.edit) {
          setType("edit");
          // Get info
          const { id } = match.params;
          setId(id);
          getKhachHang();
          getUser(INFO);
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
  const getKhachHang = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KhachHang?page=-1`,
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
          setListKhachHang(res.data);
          res.data.forEach((dt) => {
            if (dt.id === SMRM_BANGIAO) {
              setListGiaoHang([dt]);
            }
          });
        } else {
          setListKhachHang([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getUser = (info) => {
    const params = convertObjectToUrlParams({
      donVi_Id: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/user-by-dv-pb?${params}`,
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
        const newData = res.data.map((dt) => {
          return {
            ...dt,
            user: `${dt.maNhanVien} - ${dt.fullName}`,
          };
        });
        setListUser(newData);
      } else {
        setListUser([]);
      }
    });
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
          `tits_qtsx_BienBanBanGiao/${id}`,
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
          setListVatTu(JSON.parse(res.data.list_bbbgchitiets));
          setFieldsValue({
            bienBanBanGiao: {
              ...res.data,
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
  // const handleInputChange = (val, item) => {
  //   const soLuongNhap = val.target.value;
  //   if (isEmpty(soLuongNhap) || Number(soLuongNhap) <= 0) {
  //     setFieldTouch(false);
  //     setEditingRecord([...editingRecord, item]);
  //     item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
  //   } else {
  //     const newData = editingRecord.filter(
  //       (d) => d.tits_qtsx_VatTu_Id !== item.tits_qtsx_VatTu_Id
  //     );
  //     setEditingRecord(newData);
  //     newData.length === 0 && setFieldTouch(true);
  //   }
  //   const newData = [...ListVatTu];
  //   newData.forEach((ct, index) => {
  //     if (ct.tits_qtsx_VatTu_Id === item.tits_qtsx_VatTu_Id) {
  //       ct.soLuong = soLuongNhap;
  //     }
  //   });
  //   setListVatTu(newData);
  // };

  // const rendersoLuong = (item) => {
  //   let isEditing = false;
  //   let message = "";
  //   editingRecord.forEach((ct) => {
  //     if (ct.tits_qtsx_VatTu_Id === item.tits_qtsx_VatTu_Id) {
  //       isEditing = true;
  //       message = ct.message;
  //     }
  //   });
  //   return (
  //     <>
  //       <Input
  //         style={{
  //           textAlign: "center",
  //           width: "100%",
  //         }}
  //         className={`input-item`}
  //         type="number"
  //         value={item.soLuong}
  //         disabled={
  //           type === "new" || type === "edit" || type === "duyet" ? false : true
  //         }
  //         onChange={(val) => handleInputChange(val, item)}
  //       />
  //       {isEditing && <div style={{ color: "red" }}>{message}</div>}
  //     </>
  //   );
  // };
  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
      align: "center",
    },
    {
      title: "Số Booking",
      dataIndex: "soBooking",
      key: "soBooking",
      align: "center",
    },
    {
      title: "Số Cont",
      dataIndex: "soContainer",
      key: "soContainer",
      align: "center",
    },
    {
      title: "Đơn hàng",
      dataIndex: "tenDonHang",
      key: "tenDonHang",
      align: "center",
    },
    {
      title: "Số VIN",
      dataIndex: "list_ChiTiets",
      key: "list_ChiTiets",
      align: "center",
      render: (val) =>
        val &&
        val.map((ct) => {
          return <Tag color="green">{ct.maSoVin}</Tag>;
        }),
    },
    {
      title: "Số lượng",
      dataIndex: "list_ChiTiets",
      key: "soLuong",
      align: "center",
      render: (val) => <span>{val && val.length}</span>,
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
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
    saveData(values.bienBanBanGiao);
  };

  const saveAndClose = (value) => {
    validateFields()
      .then((values) => {
        saveData(values.bienBanBanGiao, value);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (user, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...user,
        list_bbbgchitiets: ListVatTu,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_BienBanBanGiao`,
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
        list_bbbgchitiets: ListVatTu,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_BienBanBanGiao?id=${id}`,
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

  const formTitle =
    type === "new"
      ? "Thêm mới biên bản giao hàng"
      : "Chỉnh sửa biên bản giao hàng";
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
        title={"BIÊN BẢN GIAO HÀNG"}
        headStyle={{
          textAlign: "center",
          backgroundColor: "#0469B9",
          color: "#fff",
        }}
      >
        <Form
          {...DEFAULT_FORM}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Row>
            <Col span={12}>
              <Card
                className="th-card-margin-bottom th-card-reset-margin"
                title={"BÊN GIAO HÀNG"}
              >
                <Row>
                  <Col span={24}>
                    <FormItem
                      label="Bên giao"
                      name={["bienBanBanGiao", "tits_qtsx_KhachHangBenGiao_Id"]}
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
                      <Select
                        className="heading-select slt-search th-select-heading"
                        data={ListGiaoHang ? ListGiaoHang : []}
                        placeholder="Chọn bên nhận"
                        optionsvalue={["id", "tenKhachHang"]}
                        style={{ width: "100%" }}
                        showSearch
                        optionFilterProp="name"
                        onSelect={(val) => {
                          ListGiaoHang.forEach((kh) => {
                            if (val === kh.id) {
                              setFieldsValue({
                                bienBanBanGiao: {
                                  diaChiBenGiao: kh.diaChi,
                                  sDTBenGiao: kh.sDT,
                                  faxBenGiao: kh.fax,
                                },
                              });
                            }
                          });
                        }}
                      />
                    </FormItem>
                  </Col>
                  <Col span={24}>
                    <FormItem
                      label="Địa chỉ"
                      name={["bienBanBanGiao", "diaChiBenGiao"]}
                      rules={[
                        {
                          type: "string",
                        },
                      ]}
                    >
                      <Input
                        className="input-item"
                        placeholder="Địa chỉ"
                        disabled={true}
                      />
                    </FormItem>
                  </Col>
                  <Col span={24}>
                    <FormItem
                      label="Điện thoại"
                      name={["bienBanBanGiao", "sDTBenGiao"]}
                      rules={[
                        {
                          type: "string",
                        },
                      ]}
                    >
                      <Input
                        className="input-item"
                        placeholder="Điện thoại"
                        disabled={true}
                      />
                    </FormItem>
                  </Col>
                  <Col span={24}>
                    <FormItem
                      label="Fax"
                      name={["bienBanBanGiao", "faxBenGiao"]}
                      rules={[
                        {
                          type: "string",
                        },
                      ]}
                    >
                      <Input
                        className="input-item"
                        placeholder="Fax"
                        disabled={true}
                      />
                    </FormItem>
                  </Col>
                  <Col span={24}>
                    <FormItem
                      label="Đại diện bên giao"
                      name={["bienBanBanGiao", "daiDienBenGiao_Id"]}
                      rules={[
                        {
                          type: "string",
                          required: true,
                        },
                      ]}
                    >
                      <Select
                        className="heading-select slt-search th-select-heading"
                        data={ListUser ? ListUser : []}
                        placeholder="Chọn đại diện bên giao"
                        optionsvalue={["user_Id", "user"]}
                        style={{ width: "100%" }}
                        showSearch
                        optionFilterProp="name"
                        onSelect={(val) => {
                          ListUser.forEach((kh) => {
                            if (val === kh.user_Id) {
                              setFieldsValue({
                                bienBanBanGiao: {
                                  sDTDaiDienBenGiao: kh.phoneNumber,
                                },
                              });
                            }
                          });
                        }}
                      />
                    </FormItem>
                  </Col>
                  <Col span={24}>
                    <FormItem
                      label="Điện thoại"
                      name={["bienBanBanGiao", "sDTDaiDienBenGiao"]}
                      rules={[
                        {
                          type: "string",
                        },
                      ]}
                    >
                      <Input
                        className="input-item"
                        placeholder="Điện thoại"
                        disabled={true}
                      />
                    </FormItem>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                className="th-card-margin-bottom th-card-reset-margin"
                title={"BÊN NHẬN HÀNG"}
              >
                <Row>
                  <Col span={24}>
                    <FormItem
                      label="Bên nhận"
                      name={["bienBanBanGiao", "tits_qtsx_KhachHang_Id"]}
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
                      <Select
                        className="heading-select slt-search th-select-heading"
                        data={ListKhachHang ? ListKhachHang : []}
                        placeholder="Chọn bên nhận"
                        optionsvalue={["id", "tenKhachHang"]}
                        style={{ width: "100%" }}
                        onSelect={(val) => {
                          ListKhachHang.forEach((kh) => {
                            if (val === kh.id) {
                              setFieldsValue({
                                bienBanBanGiao: {
                                  diaChi: kh.diaChi,
                                  sDT: kh.sDT,
                                  nguoiLienHe: kh.nguoiLienHe,
                                  fax: kh.fax,
                                },
                              });
                            }
                          });
                        }}
                      />
                    </FormItem>
                  </Col>
                  <Col span={24}>
                    <FormItem
                      label="Địa chỉ"
                      name={["bienBanBanGiao", "diaChi"]}
                      rules={[
                        {
                          type: "string",
                        },
                      ]}
                    >
                      <Input
                        className="input-item"
                        placeholder="Địa chỉ"
                        disabled={true}
                      />
                    </FormItem>
                  </Col>
                  <Col span={24}>
                    <FormItem
                      label="Điện thoại"
                      name={["bienBanBanGiao", "sDT"]}
                      rules={[
                        {
                          type: "string",
                        },
                      ]}
                    >
                      <Input
                        className="input-item"
                        placeholder="Điện thoại"
                        disabled={true}
                      />
                    </FormItem>
                  </Col>
                  <Col span={24}>
                    <FormItem
                      label="Fax"
                      name={["bienBanBanGiao", "fax"]}
                      rules={[
                        {
                          type: "string",
                        },
                      ]}
                    >
                      <Input
                        className="input-item"
                        placeholder="Fax"
                        disabled={true}
                      />
                    </FormItem>
                  </Col>
                  <Col span={24}>
                    <FormItem
                      label="Đại diện bên nhận"
                      name={["bienBanBanGiao", "nguoiLienHe"]}
                      rules={[
                        {
                          type: "string",
                        },
                      ]}
                    >
                      <Input
                        className="input-item"
                        placeholder="Đại diện bên nhận"
                        disabled={true}
                      />
                    </FormItem>
                  </Col>
                  <Col span={24}>
                    <FormItem
                      label="Điện thoại"
                      name={["bienBanBanGiao", "sDT"]}
                      rules={[
                        {
                          type: "string",
                        },
                      ]}
                    >
                      <Input
                        className="input-item"
                        placeholder="Điện thoại"
                        disabled={true}
                      />
                    </FormItem>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Form>
      </Card>
      <Card
        title="THÔNG TIN BÀN GIAO"
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
            //
            span={24}
            align="end"
          >
            <Button
              icon={<PlusOutlined />}
              onClick={onClickAddTable}
              type="primary"
            >
              Thêm
            </Button>
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
