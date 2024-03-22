import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Button,
  Tag,
  Divider,
} from "antd";
import { includes, isEmpty, map } from "lodash";
import Helpers from "src/helpers";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  Select,
  Table,
  EditableTableRow,
  ModalDeleteConfirm,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_DIEUCHUYEN_THANHLY } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  createGuid,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import ModalChonVatTu from "./ModalChonVatTu";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const ThanhLyVatTuForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [info, setInfo] = useState({});
  const [ListVatTu, setListVatTu] = useState([]);
  const [ListKhoVatTu, setListKhoVatTu] = useState([]);
  const [KhoVatTu, setKhoVatTu] = useState(null);
  const [ListUser, setListUser] = useState([]);
  const [ActiveModalChonVatTu, setActiveModalChonVatTu] = useState(null);
  const [editingRecord, setEditingRecord] = useState([]);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        getData();
        if (permission && permission.add) {
          setType("new");
          setFieldsValue({
            phieuthanhly: {
              ngayYeuCau: moment(getDateNow(), "DD/MM/YYYY"),
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
  const getData = () => {
    getUserLap(INFO, null);
    getListKho();
  };

  const getListKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-thu-tu?thutu=1&isThanhPham=false`,
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
          setListKhoVatTu(res.data);
        } else {
          setListKhoVatTu([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getUserLap = (info, nguoiLap_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/${nguoiLap_Id ? nguoiLap_Id : info.user_Id}`,
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
          phieuthanhly: {
            userLap_Id: res.data.id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      }
    });
  };

  const getInfo = (id) => {
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuThanhLyVatTu/${id}?${params}`,
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
          setInfo(res.data);
          getUserLap(INFO, res.data.userLap_Id, 1);
          getListKho();
          setKhoVatTu(res.data.khoThanhLy_Id);
          setFieldsValue({
            phieuthanhly: {
              ngayYeuCau: moment(res.data.ngayYeuCau, "DD/MM/YYYY"),
              khoThanhLy_Id: res.data.khoThanhLy_Id,
            },
          });

          const newData =
            res.data.chiTiet &&
            JSON.parse(res.data.chiTiet).map((data) => {
              const vitri = `${data.tenKe ? `${data.tenKe}` : ""}${
                data.tenTang ? ` - ${data.tenTang}` : ""
              }${data.tenNgan ? ` - ${data.tenNgan}` : ""}`;

              return {
                ...data,
                lkn_ChiTietKhoVatTu_Id: data.lkn_ChiTietKhoVatTu_Id
                  ? data.lkn_ChiTietKhoVatTu_Id.toLowerCase()
                  : createGuid(),
                vatTu: `${data.maVatTu} - ${data.tenVatTu}${
                  vitri ? ` (${vitri})` : ""
                }`,
              };
            });
          setListVatTu(newData);
        }
      })
      .catch((error) => console.error(error));
  };

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

  const deleteItemFunc = (item) => {
    const title = "vật tư";
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, title);
  };

  const deleteItemAction = (item) => {
    const newData = ListVatTu.filter(
      (d) => d.lkn_ChiTietKhoVatTu_Id !== item.lkn_ChiTietKhoVatTu_Id
    );
    setListVatTu(newData);
    setFieldTouch(true);
  };

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

  const handleInputChange = (val, item) => {
    const soLuongThanhLy = val.target.value;
    if (isEmpty(soLuongThanhLy) || Number(soLuongThanhLy) <= 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else if (soLuongThanhLy > item.soLuong) {
      setFieldTouch(false);
      item.message = `Số lượng không được lớn hơn ${item.soLuong}`;
      setEditingRecord([...editingRecord, item]);
    } else {
      const newData = editingRecord.filter(
        (d) => d.lkn_ChiTietKhoVatTu_Id !== item.lkn_ChiTietKhoVatTu_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...ListVatTu];
    newData.forEach((ct, index) => {
      if (ct.lkn_ChiTietKhoVatTu_Id === item.lkn_ChiTietKhoVatTu_Id) {
        ct.soLuongThanhLy = soLuongThanhLy;
      }
    });
    setListVatTu(newData);
  };
  const renderSoLuongThanhLy = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.lkn_ChiTietKhoVatTu_Id === item.lkn_ChiTietKhoVatTu_Id) {
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
          value={item.soLuongThanhLy}
          disabled={type === "new" || type === "edit" ? false : true}
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
      align: "center",
      width: 50,
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
      title: "Ngày nhập kho",
      dataIndex: "ngayNhan",
      key: "ngayNhan",
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
      title: "SL thanh lý",
      key: "soLuongThanhLy",
      align: "center",
      render: (record) => renderSoLuongThanhLy(record),
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
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
    saveData(values.phieuthanhly);
  };

  const saveAndClose = (value) => {
    validateFields()
      .then((values) => {
        if (ListVatTu.length === 0) {
          Helpers.alertError("Danh sách vật tư rỗng");
        } else {
          saveData(values.phieuthanhly, value);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (data, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...data,
        ngayYeuCau: data.ngayYeuCau.format("DD/MM/YYYY"),
        chiTiet_PhieuThanhLys: ListVatTu,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuThanhLyVatTu`,
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
              getData();
              setFieldsValue({
                phieuthanhly: {
                  ngayYeuCau: moment(getDateNow(), "DD/MM/YYYY"),
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
        ...data,
        id: id,
        chiTiet_PhieuThanhLys: ListVatTu.map((tl) => {
          return {
            ...tl,
            lkn_PhieuDieuChuyen_ThanhLy_Id: id,
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuThanhLyVatTu/${id}`,
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

  const handleChonVatTu = () => {
    setActiveModalChonVatTu(true);
  };

  const handleThemVatTu = (data) => {
    const newListVatTu = [...ListVatTu, ...data];
    setListVatTu(newListVatTu);
    if (type === "edit") {
      setFieldTouch(true);
    }
  };

  const handleSelectKhoThanhLy = (value) => {
    setKhoVatTu(value);
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu thanh lý vật tư "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu thanh lý vật tư"
    ) : (
      <span>
        Chi tiết phiếu thanh lý vật tư -{" "}
        <Tag color={"blue"} style={{ fontSize: "14px" }}>
          {info.maPhieuThanhLy}
        </Tag>
      </span>
    );

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_DIEUCHUYEN_THANHLY}
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
                name={["phieuthanhly", "userLap_Id"]}
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
                name={["phieuthanhly", "tenPhongBan"]}
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
                label="Kho thanh lý"
                name={["phieuthanhly", "khoThanhLy_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKhoVatTu ? ListKhoVatTu : []}
                  optionsvalue={["id", "tenCTKho"]}
                  style={{ width: "100%" }}
                  placeholder="Kho thanh lý"
                  showSearch
                  optionFilterProp={"name"}
                  onSelect={handleSelectKhoThanhLy}
                  disabled={ListVatTu && ListVatTu.length === 0 ? false : true}
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
                label="Ngày yêu cầu"
                name={["phieuthanhly", "ngayYeuCau"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  allowClear={false}
                  disabled={true}
                />
              </FormItem>
            </Col>
          </Row>
        </Form>
        <Divider style={{ marginBottom: 15 }} />
        <Row justify={"center"}>
          <h2 style={{ color: "#0469B9" }}>
            <strong>DANH SÁCH VẬT TƯ</strong>
          </h2>
        </Row>
        {type !== "detail" ? (
          <Row justify={"end"} style={{ padding: "0px 20px 10px 20px" }}>
            <Button
              icon={<PlusCircleOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              onClick={handleChonVatTu}
              disabled={KhoVatTu === null ? true : false}
            >
              Chọn vật tư
            </Button>
          </Row>
        ) : null}
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
        {type !== "detail" ? (
          <FormSubmit
            goBack={goBack}
            handleSave={onFinish}
            saveAndClose={saveAndClose}
            disabled={
              type === "new" ? fieldTouch && ListVatTu.length !== 0 : fieldTouch
            }
          />
        ) : null}
      </Card>
      <ModalChonVatTu
        openModal={ActiveModalChonVatTu}
        openModalFS={setActiveModalChonVatTu}
        itemData={{
          kho_Id: KhoVatTu,
          ListViTriKho: ListVatTu.length !== 0 && ListVatTu,
        }}
        ThemVatTu={handleThemVatTu}
      />
    </div>
  );
};

export default ThanhLyVatTuForm;
