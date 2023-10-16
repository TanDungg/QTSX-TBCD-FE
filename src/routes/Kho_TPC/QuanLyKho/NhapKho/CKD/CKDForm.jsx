import { DeleteOutlined } from "@ant-design/icons";
import { Card, Form, Input, Row, Col, DatePicker, Tag, Divider } from "antd";
import { includes, map } from "lodash";
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
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
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
                  pattern: /^\d+$/,
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

const CKDForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const [ListXuong, setListXuong] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [ListKho, setListKho] = useState([]);
  const [ListSoLot, setListSoLot] = useState([]);
  const [ListSanPham, setListSanPham] = useState([]);
  const [activeSoLuong, setActiveSoLuong] = useState(true);
  const { validateFields, resetFields, setFieldsValue, getFieldValue } = form;
  const [info, setInfo] = useState({});
  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          getUserLap(INFO);
          setType("new");
          getXuong();
          getLot();
          setFieldsValue({
            phieunhapkho: {
              ngayNhan: moment(getDateNow(), "DD/MM/YYYY"),
              ngayHoaDon: moment(getDateNow(), "DD/MM/YYYY"),
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
        if (permission && permission.edit) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "xac-nhan")) {
        if (permission && permission.edit) {
          setType("xacnhan");
          const { id } = match.params;
          setId(id);
          getInfo(id);
        } else if (permission && !permission.edit) {
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
          `Account/cbnv/${info.user_Id}?${params}`,
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
            userNhan_Id: res.data.Id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      } else {
      }
    });
  };
  const getSanPham = (id, phongBan_Id) => {
    const params = convertObjectToUrlParams({
      phongBan_Id,
      lot_Id: id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Lot/chi-tiet-by-lot-and-pb?${params}`,
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
        const newData = res.data;
        newData.forEach((ct, index) => {
          newData[index].soLuongNhap = ct.soLuongChiTiet;
          newData[index].ghiChu = "";
        });
        setListSanPham(newData);
      } else {
        setListSanPham([]);
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
  const getLot = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`Lot?page=-1`, "GET", null, "DETAIL", "", resolve, reject)
      );
    }).then((res) => {
      if (res && res.data) {
        setListSoLot(res.data);
      } else {
        setListSoLot([]);
      }
    });
  };
  const getKho = (phongBan_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-phong-ban?thuTu=1&&phongBan_Id=${phongBan_Id}&&isThanhPham=false`,
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
  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id) => {
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuNhapKhoVatTu/nhap-kho-ckd/${id}?${params}`,
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
          getUserLap(INFO, res.data.userNhan_Id);
          setInfo(res.data);
          getLot();
          getKho(res.data.phongBan_Kho_Id);
          getXuong();
          setListSanPham(JSON.parse(res.data.chiTiet));
          setActiveSoLuong(false);
          setFieldsValue({
            phieunhapkho: {
              ...res.data,
              phongBan_Id: res.data.phongBan_Kho_Id,
              ngayNhan: moment(res.data.ngayNhan, "DD/MM/YYYY"),
              soLuong: res.data.soLuongSanPham,
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
    const newData = ListSanPham.filter((d) => d.chiTiet_Id !== item.chiTiet_Id);
    setListSanPham(newData);
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

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
      align: "center",
    },
    {
      title: "Sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
    },
    {
      title: "Chi tiết",
      dataIndex: "tenChiTiet",
      key: "tenChiTiet",
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
      dataIndex: "soLuongNhap",
      key: "soLuongNhap",
      align: "center",
      editable:
        type === "new" || type === "edit" || type === "xacnhan" ? true : false,
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
      editable:
        type === "new" || type === "edit" || type === "xacnhan" ? true : false,
    },
    // {
    //   title: "Chức năng",
    //   key: "action",
    //   align: "center",
    //   width: 80,
    //   render: (value) => actionContent(value),
    // },
  ];
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const handleSave = (row) => {
    const newData = [...ListSanPham];
    const index = newData.findIndex(
      (item) => row.chiTiet_Id === item.chiTiet_Id
    );
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setFieldTouch(true);
    setListSanPham(newData);
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
        handleSave: handleSave,
      }),
    };
  });
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.phieunhapkho);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (ListSanPham.length === 0) {
          Helpers.alertError("Danh sách chi tiết rỗng");
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
        chiTiet_PhieuNhapKhoCKDs: ListSanPham,
        ngayNhan: nhapkho.ngayNhan._i,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuNhapKhoVatTu/nhap-kho-ckd`,
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
                  ngayNhan: moment(getDateNow(), "DD/MM/YYYY"),
                  userNhan_Id: nhapkho.userNhan_Id,
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
        ...nhapkho,
        chiTiet_PhieuNhapKhoCKDs: ListSanPham.map((vt) => {
          return {
            ...vt,
            lkn_PhieuNhapKhoVatTu_Id: id,
          };
        }),
        ngayNhan: nhapkho.ngayNhan._i,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuNhapKhoVatTu/nhap-kho-ckd/${id}`,
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

  const hanldeXacNhan = () => {
    const newData = {
      id: id,
      isXacNhan: true,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuDeNghiMuaHang/xac-nhan/${id}`,
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
        if (res.status !== 409) goBack();
      })
      .catch((error) => console.error(error));
  };
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận phiếu nhập kho",
    onOk: hanldeXacNhan,
  };
  const modalXK = () => {
    Modal(prop);
  };
  const save = (val) => {
    const newData = {
      id: id,
      isXacNhan: false,
      lyDo: val,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuDeNghiMuaHang/xac-nhan/${id}`,
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
        if (res.status !== 409) goBack();
      })
      .catch((error) => console.error(error));
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu nhập kho CKD "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu nhập kho CKD"
    ) : (
      <span>
        Chi tiết phiếu nhập kho CKD -{" "}
        <Tag color={"success"}>{info.maPhieuNhapKhoVatTu}</Tag>
      </span>
    );

  const dataList = reDataForTable(ListSanPham);
  const handleSelectXuong = (val) => {
    const { lot_Id } = getFieldValue("phieunhapkho");
    if (lot_Id) getSanPham(lot_Id, val);

    getKho(val);
  };
  const handleSelectSoLot = (val) => {
    setActiveSoLuong(false);
    const { phongBan_Id } = getFieldValue("phieunhapkho");
    if (phongBan_Id) getSanPham(val, phongBan_Id);
    ListSoLot.forEach((sl) => {
      if (sl.id === val) {
        setFieldsValue({
          phieunhapkho: {
            tenSanPham: sl.tenSanPham,
            soLuong: "1",
          },
        });
      }
    });
  };
  const hanldeBlurSoLuong = (sl) => {
    if (sl !== "") {
      const newData = [...ListSanPham];
      newData.forEach((sp, index) => {
        newData[index].soLuongNhap = Number(sp.soLuongChiTiet) * Number(sl);
      });
      setListSanPham(newData);
    }
  };
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
            <Col span={12}>
              <FormItem
                label="Người nhập"
                name={["phieunhapkho", "userNhan_Id"]}
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
                  onSelect={handleSelectXuong}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Kho nhập"
                name={["phieunhapkho", "cauTrucKho_Id"]}
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
                  placeholder="Chọn kho nhập"
                  optionsvalue={["id", "tenCTKho"]}
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
                name={["phieunhapkho", "ngayNhan"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  disabled={true}
                  allowClear={false}
                  onChange={(date, dateString) => {
                    setFieldsValue({
                      phieunhapkho: {
                        ngayNhan: moment(dateString, "DD/MM/YYYY"),
                      },
                    });
                  }}
                />
              </FormItem>
            </Col>

            <Col span={12}>
              <FormItem
                label="Số Lot"
                name={["phieunhapkho", "lot_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListSoLot}
                  placeholder="Chọn số Lot"
                  optionsvalue={["id", "soLot"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                  onSelect={handleSelectSoLot}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Sản phẩm"
                name={["phieunhapkho", "tenSanPham"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input disabled={true} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Số lượng"
                name={["phieunhapkho", "soLuong"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input
                  type="number"
                  disabled={
                    (type === "new" || type === "edit") && !activeSoLuong
                      ? false
                      : true
                  }
                  onBlur={(e) => hanldeBlurSoLuong(e.target.value)}
                />
              </FormItem>
            </Col>
            {/* <Col span={12}>
              <FormItem
                label="Nội dung nhập"
                name={["phieunhapkho", "noiDungNhanVatTu"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="Nội dụng nhập vật tư"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col> */}
          </Row>
          <Divider />
        </Form>
        <Table
          bordered
          columns={columns}
          scroll={{ x: 900, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          // loading={loading}
        />
        {type === "new" || type === "edit" ? (
          <FormSubmit
            goBack={goBack}
            handleSave={saveAndClose}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        ) : null}
        {/* {type === "xacnhan" && (
          <Row justify={"end"} style={{ marginTop: 15 }}>
            <Col style={{ marginRight: 15 }}>
              <Button type="primary" onClick={modalXK}>
                Xác nhận
              </Button>
            </Col>
            <Col style={{ marginRight: 15 }}>
              <Button danger onClick={hanlde}>
                Từ chối
              </Button>
            </Col>
          </Row>
        )} */}
      </Card>
      {/* <Modal
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        save={save}
      /> */}
      {/* <AddVatTuModal openModal={ActiveModal} openModalFS={setActiveModal} /> */}
    </div>
  );
};

export default CKDForm;
