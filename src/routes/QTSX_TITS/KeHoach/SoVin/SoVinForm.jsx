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
import ImportSoVIN from "./ImportSoVIN";
import ModalEditSanPham from "./ModalEditSanPham";
import Helpers from "src/helpers";

const FormItem = Form.Item;
const { EditableRow, EditableCell } = EditableTableRow;

const initialState = {
  tenLot: "",
};
const SoVinForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListDonHang, setListDonHang] = useState([]);
  const [ListSanPham, setListSanPham] = useState([]);
  const [SoLuongSanPhamToiDa, setSoLuongSanPhamToiDa] = useState([]);
  const [soLo, setSoLo] = useState("");

  const [ListSanPhamSelect, setListSanPhamSelect] = useState([]);
  const [DisableSoLuong, setDisableSoLuong] = useState(true);
  const [infoSanPham, setInfoSanPham] = useState({});
  const [ActiveModal, setActiveModal] = useState(false);
  const [ActiveModalEdit, setActiveModalEdit] = useState(false);

  const [DisableAdd, setDisableAdd] = useState(true);
  const [TypeAddTable, setTypeAddTable] = useState("new");

  const [form] = Form.useForm();
  const { tenLot } = initialState;
  const { validateFields, resetFields, setFieldsValue, getFieldValue } = form;
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
          getDonHang("", 1);
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
  const getDonHang = (id, key = 0) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_DonHang_Id: id,
      key,
    });
    const url = `tits_qtsx_SoVin/get-so-lo-chua-nhap-so-vin?${params}`;

    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "GET", null, "DETAIL", "", resolve, reject));
    })
      .then((res) => {
        if (res && res.data) {
          if (id) {
            setListSanPhamSelect(res.data);
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
  const getSoLo = (id) => {
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
          setSoLuongSanPhamToiDa(
            JSON.parse(res.data.tits_qtsx_SoLoChiTiets).length
          );
          setListSanPham(
            reDataForTable(JSON.parse(res.data.tits_qtsx_SoLoChiTiets))
          );
        } else {
          setListSanPham([]);
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
          `tits_qtsx_SoVin?tits_qtsx_SoLo_Id=${id}&&page=-1`,
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
          getDonHang(res.data[0].tits_qtsx_DonHang_Id, 1);
          setDisableAdd(false);
          setDisableSoLuong(false);
          setListSanPham(
            reDataForTable(JSON.parse(res.data[0].tits_qtsx_SoVinChiTiets))
          );
          setFieldsValue({
            Lot: {
              ...res.data[0],
            },
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
    const newData = ListSanPham.filter((d) => d.key !== item.key);
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
              setActiveModalEdit(true);
              setTypeAddTable("edit");
              setInfoSanPham(item);
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
          {/* <Divider type="vertical" />
          <a {...deleteItemVal} title="Xóa">
            <DeleteOutlined />
          </a> */}
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
      title: "Loại sản phẩm",
      dataIndex: "tenLoaiSanPham",
      key: "tenLoaiSanPham",
      align: "center",
    },
    {
      title: "Màu sắc",
      dataIndex: "tenMauSac",
      key: "tenMauSac",
      align: "center",
    },
    {
      title: "Số VIN",
      dataIndex: "maSoVin",
      key: "maSoVin",
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

  const saveAndClose = (value) => {
    validateFields()
      .then((values) => {
        saveData(values.Lot, value);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (user, saveQuit = false) => {
    if (type === "new") {
      const newData = ListSanPham.map((sp) => {
        return {
          maSoVin: sp.maSoVin,
          tits_qtsx_SoLo_Id: user.tits_qtsx_SoLo_Id,
        };
      });
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_SoVin`,
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
      const newData = ListSanPham.map((sp) => {
        return {
          id: sp.id,
          maSoVin: sp.maSoVin,
          tits_qtsx_SoLo_Id: user.tits_qtsx_SoLo_Id,
        };
      });
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_SoVin`,
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
  const validateSoLuong = (_, value) => {
    if (value && value > SoLuongSanPhamToiDa) {
      setDisableAdd(true);
      return Promise.reject(
        new Error(
          `Số lượng lô phải nhỏ hơn hoặc bằng số lượng đơn hàng ${SoLuongSanPhamToiDa}!`
        )
      );
    } else if (value && Number(value) === 0) {
      setDisableAdd(true);
      return Promise.reject(new Error(`Số lượng phải lớn hơn 0!`));
    } else if (!value) {
      setDisableAdd(true);
      return Promise
        .reject
        // new Error(`Số lượng là bắt buộc!`)
        ();
    } else {
      setDisableAdd(false);
      return Promise.resolve();
    }
  };
  const formTitle = type === "new" ? "Thêm mới số VIN" : "Chỉnh sửa số VIN";
  const onClickAddTable = () => {
    getSoLo(soLo);
  };
  const editSanPham = (data, type) => {
    let check = false;
    ListSanPham.forEach((sp) => {
      if (sp.maSoVin === data.maSoVin) {
        check = true;
      }
    });
    if (check) {
      Helpers.alertWarning("Mã số VIN trùng lặp.");
    } else {
      setActiveModalEdit(false);
      if (type === "new") {
        setListSanPham(reDataForTable([...ListSanPham, data]));
      } else {
        setFieldTouch(true);
        setListSanPham([
          ...ListSanPham.map((sp) => {
            if (sp.key === data.key) {
              return data;
            } else {
              return sp;
            }
          }),
        ]);
      }
    }
  };
  const addSanPhamImport = (data) => {
    setListSanPham(reDataForTable([...ListSanPham, ...data]));
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin số VIN"}
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
                  optionsvalue={["tits_qtsx_DonHang_Id", "maPhieu"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type !== "new"}
                  onSelect={(val) => {
                    getDonHang(val);
                    setFieldsValue({
                      Lot: {
                        soLuongDonHang: null,
                        soLuong: null,
                        tits_qtsx_DonHangChiTiet_Id: null,
                      },
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
                label="Số Lô"
                name={["Lot", "tits_qtsx_SoLo_Id"]}
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
                  placeholder="Chọn số Lô"
                  optionsvalue={["tits_qtsx_SoLo_Id", "tenSoLo"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type !== "new"}
                  onSelect={(val) => {
                    setDisableSoLuong(false);
                    setDisableAdd(false);
                    setSoLo(val);
                  }}
                />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title="Thông tin số VIN"
        headStyle={{
          textAlign: "center",
          backgroundColor: "#0469B9",
          color: "#fff",
        }}
        style={{
          marginBottom: 0,
        }}
      >
        {type === "new" && (
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
              disabled={DisableAdd}
            >
              Thêm
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={() => setActiveModal(true)}
              type="primary"
              disabled={DisableAdd}
            >
              Import
            </Button>
          </Col>
        )}
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1300, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={ListSanPham}
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
      <ImportSoVIN
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        tits_qtsx_SoLo_Id={soLo}
        addSanPham={addSanPhamImport}
      />

      <ModalEditSanPham
        openModal={ActiveModalEdit}
        openModalFS={setActiveModalEdit}
        info={infoSanPham}
        editSanPham={editSanPham}
        type={TypeAddTable}
      />
    </div>
  );
};

export default SoVinForm;
