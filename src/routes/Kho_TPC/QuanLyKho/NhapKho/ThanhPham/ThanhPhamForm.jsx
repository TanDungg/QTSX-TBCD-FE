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
import AddSanPhamModal from "./AddSanPhamModal";
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

const ThanhPhamForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const [ListMauSac, setListMauSac] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [ListKho, setListKho] = useState([]);
  const [ListXuong, setListXuong] = useState([]);
  const [ListSoLot, setListSoLot] = useState([]);

  const [ListSanPham, setListSanPham] = useState([]);
  const [ActiveModal, setActiveModal] = useState(false);

  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});
  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          getUserLap(INFO);
          setType("new");
          getSoLot();
          getXuong();
          setFieldsValue({
            phieunhapkho: {
              ngayNhap: moment(getDateNow(), "DD/MM/YYYY"),
              ngaySanXuat: moment(getDateNow(), "DD/MM/YYYY"),
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
            userLap_Id: res.data.Id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      } else {
      }
    });
  };

  const getSoLot = (id) => {
    if (id) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`lot/${id}`, "GET", null, "DETAIL", "", resolve, reject)
        );
      }).then((res) => {
        if (res && res.data) {
          setListSoLot([res.data]);
        } else {
          setListSoLot([]);
        }
      });
    } else {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`lot?page=-1`, "GET", null, "DETAIL", "", resolve, reject)
        );
      }).then((res) => {
        if (res && res.data) {
          setListSoLot(res.data);
        } else {
          setListSoLot([]);
        }
      });
    }
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
  const getKho = (phongBan_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-phong-ban?thuTu=1&&phongBan_Id=${phongBan_Id}&&isThanhPham=true`,
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
  const getMauSac = (sanPham_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `SanPham/${sanPham_Id}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListMauSac(JSON.parse(res.data.mauSac));
        } else {
          setListMauSac([]);
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
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuNhapKhoThanhPham/${id}?${params}`,
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
          setListSanPham(JSON.parse(res.data.chiTietThanhPham));
          getUserLap(INFO, res.data.userNhan_Id);
          setInfo(res.data);
          getXuong();
          getKho(res.data.phongBan_Id);
          getSoLot();
          getMauSac(JSON.parse(res.data.chiTietThanhPham)[0].sanPham_Id);
          setFieldsValue({
            phieunhapkho: {
              ...res.data,
              ngayNhap: moment(res.data.ngayNhap, "DD/MM/YYYY"),
              ngaySanXuat: moment(res.data.ngaySanXuat, "DD/MM/YYYY"),
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
    setListSanPham([]);
    setFieldsValue({
      phieunhapkho: {
        lot_Id: null,
      },
    });
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
  const hanldeSelectMauSac = (val) => {
    const newData = [...ListSanPham];
    newData[0].mauSac_Id = val;
    setListSanPham(newData);
    setFieldTouch(true);
  };
  const renderMauSac = (item, record) => {
    return (
      <Select
        className="heading-select slt-search th-select-heading"
        data={ListMauSac}
        value={record.mauSac_Id}
        placeholder="Chọn màu sắc"
        optionsvalue={["mauSac_Id", "tenMauSac"]}
        style={{ width: "100%" }}
        showSearch
        optionFilterProp="name"
        disabled={type === "new" || type === "edit" ? false : true}
        onSelect={hanldeSelectMauSac}
      />
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
      title: "Loại sản phẩm",
      dataIndex: "tenLoaiSanPham",
      key: "tenLoaiSanPham",
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
      title: "Màu sắc",
      dataIndex: "mauSac",
      key: "mauSac",
      align: "center",
      render: (val, record) => renderMauSac(val, record),
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
  const handleSave = (row) => {
    const newData = [...ListSanPham];
    const index = newData.findIndex((item) => row.vatTu_Id === item.vatTu_Id);
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
  let renderChiTiet = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Mã chi tiết",
      dataIndex: "maChiTiet",
      key: "maChiTiet",
      align: "center",
    },
    {
      title: "Tên chi tiết",
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
      dataIndex: "soLuongChiTiet",
      key: "soLuongChiTiet",
      align: "center",
    },
    {
      title: "Kích thước",
      dataIndex: "kichThuoc",
      key: "kichThuoc",
      align: "center",
    },
    // {
    //   title: "Chức năng",
    //   key: "action",
    //   align: "center",
    //   width: 100,
    //   render: (value) => actionContentChiTiet(value),
    // },
  ];

  const columnChilden = map(renderChiTiet, (col) => {
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
    saveData(values.phieunhapkho);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (ListSanPham.length === 0) {
          Helpers.alertError("Danh sách sản phẩm rỗng");
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
        chiTiet_PhieuNhapKhoThanhPhams: ListSanPham.map((tp) => {
          return {
            ...tp,
            lst_ChiTiets: JSON.parse(tp.chiTiet).map((ct) => {
              return {
                lkn_ChiTiet_Id: ct.chiTiet_Id,
                soLuongNhap: ct.soLuongChiTiet,
              };
            }),
          };
        }),
        ngaySanXuat: nhapkho.ngaySanXuat._i,
        ngayNhap: nhapkho.ngayNhap._i,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuNhapKhoThanhPham`,
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
                  ngayHoaDon: moment(getDateNow(), "DD/MM/YYYY"),
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
        chiTiet_PhieuNhapKhoThanhPhams: ListSanPham.map((vt) => {
          return {
            ...vt,
            lkn_PhieuNhapKhoThanhPham_Id: id,
          };
        }),
        ngaySanXuat: nhapkho.ngaySanXuat._i,
        ngayNhap: nhapkho.ngayNhap._i,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuNhapKhoThanhPham/${id}`,
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
      "Tạo phiếu nhập kho thành phẩm "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu nhập kho thành phẩm"
    ) : (
      <span>
        Chi tiết phiếu nhập kho thành phẩm -{" "}
        <Tag color={"success"}>{info.maPhieuNhapKhoThanhPham}</Tag>
      </span>
    );
  const handleSoLot = (vaL) => {
    ListSoLot.forEach((solot) => {
      if (solot.id === vaL) {
        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(
              `SanPham/${solot.sanPham_Id}`,
              "GET",
              null,
              "LIST",
              "",
              resolve,
              reject
            )
          );
        })
          .then((res) => {
            if (res && res.data) {
              setListMauSac(JSON.parse(res.data.mauSac));
              setListSanPham([
                {
                  ...res.data,
                  sanPham_Id: JSON.parse(res.data.mauSac)[0].sanPham_Id,
                  mauSac_Id: JSON.parse(res.data.mauSac)[0].mauSac_Id,
                  soLuongNhap: "1",
                },
              ]);
            } else {
              setListMauSac([]);
            }
          })
          .catch((error) => console.error(error));
      }
    });
  };

  const addSanPham = (data) => {
    let check = false;
    ListSanPham.forEach((dl) => {
      if (
        dl.sanPham_Id.toLowerCase() === data.sanPham_Id &&
        dl.mauSac_Id === data.mauSac_Id
      ) {
        check = true;
        Helpers.alertError(`Sản phẩm đã được thêm`);
      }
    });
    !check && ListSanPham.length > 0 && setListSanPham([...ListSanPham, data]);
    !check && ListSanPham.length === 0 && setListSanPham([data]);
    !check && setFieldTouch(true);
  };
  const dataList = reDataForTable(ListSanPham);
  const hanldeSelectXuong = (val) => {
    getKho(val);
    setFieldsValue({
      phieunhapkho: {
        cauTrucKho_Id: null,
      },
    });
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
                label="Xưởng sản xuất"
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
                  placeholder="Chọn xưởng sản xuất"
                  optionsvalue={["id", "tenPhongBan"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                  onSelect={hanldeSelectXuong}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Kho"
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
                  placeholder="Chọn kho"
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
                label="Ngày sản xuất"
                name={["phieunhapkho", "ngaySanXuat"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  disabled={type === "new" || type === "edit" ? false : true}
                  allowClear={false}
                  onChange={(date, dateString) => {
                    setFieldsValue({
                      phieunhapkho: {
                        ngaySanXuat: moment(dateString, "DD/MM/YYYY"),
                      },
                    });
                  }}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Ngày nhập"
                name={["phieunhapkho", "ngayNhap"]}
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
                        ngayNhap: moment(dateString, "DD/MM/YYYY"),
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
                  onSelect={handleSoLot}
                />
              </FormItem>
            </Col>
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
          expandable={{
            expandedRowRender: (record) => (
              <Table
                style={{ marginLeft: "80px", width: "80%" }}
                bordered
                columns={columnChilden}
                scroll={{ x: 500 }}
                components={components}
                className="gx-table-responsive th-F1D065-head"
                dataSource={reDataForTable(JSON.parse(record.chiTiet))}
                size="small"
                rowClassName={"editable-row"}
                // loading={loading}
                pagination={false}
              />
            ),
            rowExpandable: (record) => record.name !== "Not Expandable",
          }}
        />
        {type === "new" || type === "edit" ? (
          <FormSubmit
            goBack={goBack}
            handleSave={saveAndClose}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        ) : null}
        <AddSanPhamModal
          openModal={ActiveModal}
          openModalFS={setActiveModal}
          addSanPham={addSanPham}
        />
      </Card>
    </div>
  );
};

export default ThanhPhamForm;
