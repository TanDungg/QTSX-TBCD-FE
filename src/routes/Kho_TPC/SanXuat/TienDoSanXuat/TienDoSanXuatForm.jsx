import {
  CloseOutlined,
  DeleteOutlined,
  RollbackOutlined,
  SaveOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Card, Form, Input, Row, Col, DatePicker, Divider, Button } from "antd";
import { includes, isEmpty, map } from "lodash";
import Helpers from "src/helpers";
import moment from "moment";
import React, { useEffect, useState, useRef, useContext } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  Select,
  Table,
  ModalDeleteConfirm,
  Modal,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTimeNow,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import ModalThemKe from "./ModalThemKe";
const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={
          title === "Số lượng"
            ? [
                {
                  pattern: /^[1-9]\d*$/,
                  message: "Số lượng không hợp lệ!",
                },
              ]
            : null
        }
      >
        <Input
          style={{
            margin: 0,
            width: "100%",
            textAlign: "center",
          }}
          ref={inputRef}
          onPressEnter={save}
          onBlur={save}
        />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};

const FormItem = Form.Item;

const TienDoSanXuatForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const [ListUser, setListUser] = useState([]);
  const [ListXuong, setListXuong] = useState([]);

  const [ListSanPham, setListSanPham] = useState([]);
  const [ActiveModal, setActiveModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState([]);

  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});
  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          getUserLap(INFO);
          setType("new");
          getXuong();
          setFieldsValue({
            phieunhapkho: {
              ngayXuatKho: moment(
                `${getDateNow()} ${getTimeNow()}`,
                "DD/MM/YYYY HH:mm"
              ),
            },
          });
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else if (includes(match.url, "chinh-sua")) {
        if (permission && permission.edit) {
          setType("edit");
          const { id } = match.params;
          setId(id);
          getInfo(id);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "chi-tiet")) {
        if (permission && permission.view) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id);
        } else if (permission && !permission.view) {
          history.push("/home");
        }
      } else if (includes(match.url, "xac-nhan")) {
        if (permission && permission.cof) {
          setType("xacnhan");
          const { id } = match.params;
          setId(id);
          getInfo(id);
        } else if (permission && !permission.cof) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserLap = (info, nguoiLap_Id) => {
    const params = convertObjectToUrlParams({
      id: nguoiLap_Id ? nguoiLap_Id : info.user_Id,
      donVi_Id: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/cbnv/${nguoiLap_Id ? nguoiLap_Id : info.user_Id}?${params}`,
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
        setListUser([res.data]);
        setFieldsValue({
          phieunhapkho: {
            userLap_Id: res.data.Id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      } else {
      }
    });
  };
  const getXuong = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBan?page=-1&&donviid=${INFO.donVi_Id}`,
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
        const xuong = [];
        res.data.forEach((x) => {
          if (x.tenPhongBan.toLowerCase().includes("xưởng")) {
            xuong.push(x);
          }
        });
        setListXuong(xuong);
      } else {
        setListXuong([]);
      }
    });
  };

  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuNhapTienDoSanXuat/${id}`,
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
          setListSanPham(res.data.list_ChiTietPhieuNhapTienDoSanXuats);
          getUserLap(INFO, res.data.createdBy);
          setInfo(res.data);
          getXuong();

          setFieldsValue({
            phieunhapkho: {
              ...res.data,
              ngay: moment(res.data.ngay, "DD/MM/YYYY HH:mm"),
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Quay lại trang bộ phận
   *
   */
  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new"
          ? "/them-moi"
          : type === "edit"
          ? `/${id}/chinh-sua`
          : type === "detail"
          ? `/${id}/chi-tiet`
          : `/${id}/xac-nhan`,
        ""
      )}`
    );
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
    if (type === "edit" && info.isDuyet) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuXuatKhoThanhPham/sau-duyet/${item.id}`,
            "DELETE",
            null,
            "DELETE",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res.status !== 409) {
            getInfo(id);
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    } else {
      const newData = ListSanPham.filter(
        (d) => d.sanPham_Id !== item.sanPham_Id
      );
      setFieldTouch(true);
      setListSanPham(newData);
    }
  };

  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const deleteItemVal =
      permission &&
      permission.del &&
      (type === "new" || type === "edit") &&
      ListSanPham.length > 1
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
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
  const handleInputChange = (val, item) => {
    const soLuongNhap = val.target.value;
    if (isEmpty(soLuongNhap) || Number(soLuongNhap) <= 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else {
      const newData = editingRecord.filter(
        (d) => d.sanPham_Id !== item.sanPham_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...ListSanPham];
    newData.forEach((ct, index) => {
      if (ct.sanPham_Id === item.sanPham_Id) {
        ct.soLuong = soLuongNhap;
      }
    });
    setListSanPham(newData);
  };
  const rendersoLuong = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.sanPham_Id === item.sanPham_Id) {
        isEditing = true;
        message = ct.message;
      }
    });
    const disable = type === "new" || type === "edit" ? false : true;
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
          disabled={disable}
          onChange={(val) => handleInputChange(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };
  const XacNhanEdit = (data) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuXuatKhoThanhPham/sau-duyet/${data.id}`,
          "PUT",
          {
            id: data.id,
            lkn_ChiTietKhoThanhPham_Id: data.lkn_ChiTietKhoThanhPham_Id,
            soLuong: data.soLuong,
          },
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          getInfo(id);
          setFieldTouch(false);
        }
      })
      .catch((error) => console.error(error));
  };
  const prop2 = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận chỉnh sửa",
  };
  const modalEdit = (val) => {
    Modal({
      ...prop2,
      onOk: () => {
        XacNhanEdit(val);
      },
    });
  };
  let colValues = () => {
    const col = [
      {
        title: "STT",
        dataIndex: "key",
        key: "key",
        width: 45,
        align: "center",
      },
      {
        title: "Mã sản phẩm",
        dataIndex: "maSanPham",
        key: "maSanPham",
        align: "center",
      },
      {
        title: "Tên sản phẩm",
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
        title: "Số lượng",
        key: "soLuong",
        align: "center",
        render: (record) => rendersoLuong(record),
      },
      {
        title: "Chức năng",
        key: "action",
        align: "center",
        width: 80,
        render: (value) => actionContent(value),
      },
    ];
    if (type === "edit" && info.isDuyet) {
      return [
        {
          title: "Chỉnh sửa",
          key: "edit",
          align: "center",
          width: 80,
          render: (val) => {
            return (
              <Button
                style={{ margin: 0 }}
                disabled={
                  (val.ngan_Id && type === "edit") ||
                  (!val.ke_Id && type === "edit")
                    ? false
                    : true
                }
                type="primary"
                onClick={() => modalEdit(val)}
              >
                Lưu
              </Button>
            );
          },
        },
        ...col,
      ];
    } else {
      return col;
    }
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(colValues(), (col) => {
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
    saveData(values.phieunhapkho);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (ListSanPham.length === 0) {
          Helpers.alertWarning("Danh sách sản phẩm rỗng");
        } else {
          saveData(values.phieunhapkho, val);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (nhapkho, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...nhapkho,
        list_ChiTietPhieuNhapTienDoSanXuats: ListSanPham,
        ngay: nhapkho.ngay._i,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuNhapTienDoSanXuat`,
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
              setFieldsValue({
                phieunhapkho: {
                  ngay: moment(getDateNow(), "DD/MM/YYYY"),
                  userLap_Id: nhapkho.userLap_Id,
                  tenPhongBan: nhapkho.tenPhongBan,
                },
              });
              setFieldTouch(false);
              setListSanPham([]);
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        id: id,
        ...info,
        ...nhapkho,
        list_ChiTietPhieuNhapTienDoSanXuats: ListSanPham,
        ngay: nhapkho.ngay._i,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuNhapTienDoSanXuat/${id}`,
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
            getInfo(id);
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu nhập tiến độ sản xuất "
    ) : type === "edit" ? (
      <span>Chỉnh sửa phiếu nhập tiến độ sản xuất</span>
    ) : type === "detail" ? (
      <span>Chi tiết phiếu nhập tiến độ sản xuất</span>
    ) : (
      <span>Xác nhận phiếu nhập tiến độ sản xuất</span>
    );
  const addSanPham = (vaL) => {
    setListSanPham([...ListSanPham, vaL]);
    setFieldTouch(true);
  };

  const saveDuyetTuChoi = (isDuyet) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuXuatKhoThanhPham/duyet/${id}`,
          "PUT",
          {
            id: id,
            lyDoTuChoi: !isDuyet ? "Từ chối" : undefined,
          },
          !isDuyet ? "TUCHOI" : "XACNHAN",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          getInfo(id);
          setFieldTouch(false);
        }
      })
      .catch((error) => console.error(error));
  };
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận duyệt phiếu xuất kho",
    onOk: () => {
      saveDuyetTuChoi(true);
    },
  };
  const modalDuyet = () => {
    Modal(prop);
  };
  const prop1 = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận từ chối phiếu xuất kho",
    onOk: () => {
      saveDuyetTuChoi(false);
    },
  };
  const modalTuChoi = () => {
    Modal(prop1);
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={formTitle}
        back={goBack}
        // buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_CUSTOM}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Row>
            <Col span={12}>
              <FormItem
                label="Người lập"
                name={["phieunhapkho", "userLap_Id"]}
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
                  optionsvalue={["Id", "fullName"]}
                  style={{ width: "100%" }}
                  disabled={true}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Ban/Phòng"
                name={["phieunhapkho", "tenPhongBan"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input className="input-item" disabled={true} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Xưởng"
                name={["phieunhapkho", "phongBan_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListXuong}
                  placeholder="Chọn xưởng"
                  optionsvalue={["id", "tenPhongBan"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Ngày nhập"
                name={["phieunhapkho", "ngay"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY HH:mm"}
                  disabled={type === "new" || type === "edit" ? false : true}
                  allowClear={false}
                  onChange={(date, dateString) => {
                    setFieldsValue({
                      phieunhapkho: {
                        ngay: moment(dateString, "DD/MM/YYYY HH:mm"),
                      },
                    });
                  }}
                />
              </FormItem>
            </Col>
            {type === "new" || type === "edit" ? (
              <>
                <Col
                  xxl={12}
                  xl={12}
                  lg={24}
                  md={24}
                  sm={24}
                  xs={24}
                  style={{ marginBottom: 8 }}
                  align="center"
                >
                  <Button
                    icon={<ShoppingCartOutlined />}
                    type="primary"
                    onClick={() => setActiveModal(true)}
                  >
                    Chọn sản phẩm
                  </Button>
                </Col>
              </>
            ) : null}
          </Row>
          <Divider />
        </Form>
        <Table
          bordered
          columns={columns}
          scroll={{ x: 900, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(ListSanPham)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
        />
        {type === "new" || type === "edit" ? (
          <FormSubmit
            goBack={goBack}
            handleSave={saveAndClose}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        ) : null}
        {type === "xacnhan" && info.tinhTrang === "Chưa duyệt" ? (
          <>
            <Divider />
            <Row style={{ marginTop: 20 }}>
              <Col style={{ marginBottom: 8, textAlign: "center" }} span={24}>
                <Button
                  className="th-btn-margin-bottom-0"
                  icon={<RollbackOutlined />}
                  onClick={goBack}
                  style={{ marginTop: 10 }}
                >
                  Quay lại
                </Button>
                <Button
                  className="th-btn-margin-bottom-0"
                  type="primary"
                  onClick={() => modalDuyet()}
                  icon={<SaveOutlined />}
                  style={{ marginTop: 10 }}
                >
                  Duyệt
                </Button>
                <Button
                  className="th-btn-margin-bottom-0"
                  icon={<CloseOutlined />}
                  style={{ marginTop: 10 }}
                  onClick={() => modalTuChoi()}
                  type="danger"
                >
                  Từ chối
                </Button>
              </Col>
            </Row>
          </>
        ) : null}
        <ModalThemKe
          openModal={ActiveModal}
          openModalFS={setActiveModal}
          addKe={addSanPham}
          listSanPham={ListSanPham}
        />
      </Card>
    </div>
  );
};

export default TienDoSanXuatForm;
