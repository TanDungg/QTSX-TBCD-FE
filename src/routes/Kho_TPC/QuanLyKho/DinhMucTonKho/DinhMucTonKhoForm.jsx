import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Button,
  Divider,
  Tag,
} from "antd";
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
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_TWO_COL } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import AddVatTuModal from "./AddVatTuModal";
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
          title === "SL cần mua"
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

const DinhMucTonKhoForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const [listVatTu, setListVatTu] = useState([]);
  const [ListDinhMucTonKho, setListDinhMucTonKho] = useState([]);
  const [ListKho, setListKho] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [listVatTuForm, setListVatTuForm] = useState([]);
  const [ActiveModal, setActiveModal] = useState(false);
  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});
  const [editingRecord, setEditingRecord] = useState([]);
  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          getUserLap(INFO);
          setType("new");
          getLoaiDinhMucTonKho();
          getKho();
          setFieldsValue({
            dinhmuctonkho: {
              ngayNhap: moment(getDateNow(), "DD/MM/YYYY"),
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
          getLoaiDinhMucTonKho();
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "chi-tiet")) {
        if (permission && permission.view) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getLoaiDinhMucTonKho();
          getInfo(id);
        } else if (permission && !permission.view) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserLap = (info, userLap_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/${userLap_Id ? userLap_Id : info.user_Id}`,
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
          dinhmuctonkho: {
            userLap_Id: res.data.id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      } else {
      }
    });
  };
  const getLoaiDinhMucTonKho = () => {
    const params = convertObjectToUrlParams({
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `LoaiDinhMucTonKho?${params}`,
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
        setListDinhMucTonKho(res.data);
      } else {
        setListDinhMucTonKho([]);
      }
    });
  };
  const getKho = () => {
    const params = convertObjectToUrlParams({
      thuTu: 1,
      isThanhPham: false,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-phong-ban?${params}`,
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
        setListKho(res.data);
      } else {
        setListKho([]);
      }
    });
  };

  const getVatTu = () => {
    const params = convertObjectToUrlParams({ page: -1 });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `VatTu?${params}`,
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
          setListVatTuForm(res.data);
        } else {
          setListVatTuForm([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id) => {
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id.toLowerCase(),
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_DinhMucTonKho/${id}?${params}`,
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
          getUserLap(INFO, res.data.userYeuCau_Id);
          getKho();
          getVatTu();
          setFieldsValue({
            dinhmuctonkho: {
              ...res.data,
              ngayNhap: moment(res.data.ngayNhap, "DD/MM/YYYY"),
              phongBan_Id: res.data.phongBan,
            },
          });
          setInfo(res.data);
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
          : `/${id}/chi-tiet`,
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
    const title = "vật tư";
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const newData = listVatTu.filter((d) => d.vatTu_Id !== item.vatTu_Id);
    setListVatTu(newData);
  };

  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const deleteItemVal =
      permission && permission.del && (type === "new" || type === "edit")
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

  const handleInputChange = (val, item, sl) => {
    const soLuongThanhLy = val.target.value;
    if (isEmpty(soLuongThanhLy) || Number(soLuongThanhLy) <= 0) {
      setFieldTouch(false);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
      item.title = sl;
      if (editingRecord.length === 0) {
        setEditingRecord([...editingRecord, item]);
      } else {
        editingRecord.forEach((e) => {
          if (e.vatTu_Id === item.vatTu_Id && e.title !== sl) {
            setEditingRecord([...editingRecord, item]);
          }
        });
      }
    } else if (
      Number(soLuongThanhLy) >= Number(item.slTonKhoToiDa) &&
      sl === "slTonKhoToiThieu"
    ) {
      setFieldTouch(false);
      item.title = sl;
      item.message = `SL tồn kho tối thiếu không được lớn hơn hơn hoặc bằng SL tồn kho tối đa`;
      if (editingRecord.length === 0) {
        setEditingRecord([...editingRecord, item]);
      } else {
        editingRecord.forEach((e) => {
          if (e.vatTu_Id === item.vatTu_Id && e.title !== sl) {
            setEditingRecord([...editingRecord, item]);
          }
        });
      }
    } else if (
      Number(soLuongThanhLy) <= Number(item.slTonKhoToiThieu) &&
      sl === "slTonKhoToiDa"
    ) {
      setFieldTouch(false);
      item.title = sl;
      item.message = `SL tồn kho tối đa không được nhỏ hơn hoặc bằng SL tồn kho tối thiếu`;
      if (editingRecord.length === 0) {
        setEditingRecord([...editingRecord, item]);
      } else {
        editingRecord.forEach((e) => {
          if (e.vatTu_Id === item.vatTu_Id && e.title !== sl) {
            setEditingRecord([...editingRecord, item]);
          }
        });
      }
    } else {
      const newData = editingRecord.filter(
        (d) => !(d.vatTu_Id === item.vatTu_Id && d.title === sl)
      );
      console.log(newData);
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...listVatTu];
    newData.forEach((ct, index) => {
      if (ct.vatTu_Id === item.vatTu_Id) {
        ct[sl] = soLuongThanhLy;
      }
    });
    setListVatTu(newData);
  };
  const renderSoLuong = (item, sl) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.vatTu_Id === item.vatTu_Id && ct.title === sl) {
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
          value={item[sl]}
          disabled={type === "new" || type === "edit" ? false : true}
          onChange={(val) => handleInputChange(val, item, sl)}
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
      title: "SL tồn kho tối thiểu",
      render: (record) => renderSoLuong(record, "slTonKhoToiThieu"),
      key: "slTonKhoToiThieu",
      align: "center",
    },
    {
      title: "SL tồn kho tối đa",
      key: "slTonKhoToiDa",
      render: (record) => renderSoLuong(record, "slTonKhoToiDa"),
      align: "center",
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
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
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    if (listVatTu.length === 0 && type === "new") {
      Helpers.alertError("Danh sách vật tư rỗng");
    } else {
      saveData(values.dinhmuctonkho);
    }
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (listVatTu.length === 0 && type === "new") {
          Helpers.alertError("Danh sách vật tư rỗng");
        } else {
          saveData(values.dinhmuctonkho, val);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (dinhmuctonkho, saveQuit = false) => {
    if (type === "new") {
      const newData = listVatTu.map((vt) => {
        return {
          ...dinhmuctonkho,
          ngayNhap: dinhmuctonkho.ngayNhap._i,
          slTonKhoToiThieu: vt.slTonKhoToiThieu,
          slTonKhoToiDa: vt.slTonKhoToiDa,
          ghiChu: vt.ghiChu,
          vatTu_Id: vt.vatTu_Id,
        };
      });
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_DinhMucTonKho`,
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
              setFieldsValue({
                dinhmuctonkho: {
                  userLap_Id: dinhmuctonkho.userLap_Id,
                  tenPhongBan: dinhmuctonkho.tenPhongBan,
                  ngayNhap: moment(dinhmuctonkho.ngayNhap, "DD/MM/YYYY"),
                },
              });
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
        ...dinhmuctonkho,
        ngayNhap: dinhmuctonkho.ngayNhap._i,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_DinhMucTonKho/${id}`,
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

  const hanldeThem = () => {
    setActiveModal(true);
  };
  const addVatu = (vatTus) => {
    let check = false;
    listVatTu.forEach((dl) => {
      if (dl.vatTu_Id.toLowerCase() === vatTus.vatTu_Id) {
        check = true;
        Helpers.alertError(`Vật tư đã được thêm`);
      }
    });
    !check && setListVatTu([...listVatTu, vatTus]);
  };

  const formTitle =
    type === "new" ? (
      "Thêm mới định mức tồn kho "
    ) : type === "edit" ? (
      "Chỉnh sửa định mức tồn kho"
    ) : (
      <span>
        Chi tiết định mức tồn kho -{" "}
        <Tag color={info.isXacNhan === true ? "success" : "blue"}>
          {info.maPhieuYeuCau}
        </Tag>
      </span>
    );

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_TWO_COL}
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
                label="Người lập"
                name={["dinhmuctonkho", "userLap_Id"]}
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
                  optionsvalue={["id", "fullName"]}
                  style={{ width: "100%" }}
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
                label="Ban/Phòng"
                name={["dinhmuctonkho", "tenPhongBan"]}
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
                label="Kho"
                name={["dinhmuctonkho", "cauTrucKho_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKho}
                  placeholder="Chọn kho"
                  optionsvalue={["id", "tenCTKho"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
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
                label="Loại định mức"
                name={["dinhmuctonkho", "loaiDinhMucTonKho_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListDinhMucTonKho ? ListDinhMucTonKho : []}
                  optionsvalue={["id", "tenLoaiDinhMucTonKho"]}
                  style={{ width: "100%" }}
                  placeholder="Loại định mức"
                  disabled={type === "new" || type === "edit" ? false : true}
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
                label="Ngày lập"
                name={["dinhmuctonkho", "ngayNhap"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  allowClear={false}
                  onChange={(date, dateString) => {
                    setFieldsValue({
                      dinhmuctonkho: {
                        ngayNhap: moment(dateString, "DD/MM/YYYY"),
                      },
                    });
                  }}
                  disabled={true}
                />
              </FormItem>
            </Col>
            {type === "edit" && (
              <>
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
                    name={["dinhmuctonkho", "vatTu_Id"]}
                    rules={[
                      {
                        type: "string",
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      className="heading-select slt-search th-select-heading"
                      data={listVatTuForm}
                      optionsvalue={["id", "tenVatTu"]}
                      style={{ width: "100%" }}
                      placeholder="Vật tư"
                      disabled={type === "edit" ? false : true}
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
                    label="SL tồn kho tối thiểu"
                    name={["dinhmuctonkho", "slTonKhoToiThieu"]}
                    rules={[
                      {
                        required: true,
                      },
                      {
                        pattern: /^[1-9]\d*$/,
                        message: "Số lượng phải lớn hơn 0",
                      },
                    ]}
                  >
                    <Input
                      type="number"
                      placeholder="SL tồn kho tối thiểu"
                    ></Input>
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
                    label="SL tồn kho tối đa"
                    name={["dinhmuctonkho", "slTonKhoToiDa"]}
                    rules={[
                      {
                        required: true,
                      },
                      {
                        pattern: /^[1-9]\d*$/,
                        message: "Số lượng phải lớn hơn 0",
                      },
                    ]}
                  >
                    <Input
                      type="number"
                      placeholder="SL tồn kho tối đa"
                    ></Input>
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
                    name={["dinhmuctonkho", "ghiChu"]}
                    rules={[
                      {
                        type: "string",
                      },
                    ]}
                  >
                    <Input placeholder="Ghi chú"></Input>
                  </FormItem>
                </Col>
              </>
            )}
            {type === "new" ? (
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
                  icon={<PlusOutlined />}
                  type="primary"
                  onClick={hanldeThem}
                >
                  Thêm
                </Button>
              </Col>
            ) : null}
          </Row>
          {type === "new" && <Divider />}
        </Form>
        {type === "new" && (
          <Table
            style={{ margin: "20px 0px" }}
            bordered
            columns={columns}
            scroll={{ x: 1300, y: "55vh" }}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(listVatTu)}
            size="small"
            rowClassName={"editable-row"}
            pagination={false}
            // loading={loading}
          />
        )}
        {type === "new" || type === "edit" ? (
          <FormSubmit
            goBack={goBack}
            handleSave={saveAndClose}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        ) : null}
      </Card>
      <AddVatTuModal
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        addVatTu={addVatu}
      />
    </div>
  );
};

export default DinhMucTonKhoForm;
