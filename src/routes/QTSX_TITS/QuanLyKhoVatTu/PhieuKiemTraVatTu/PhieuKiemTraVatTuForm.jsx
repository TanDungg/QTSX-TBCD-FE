import { Card, Form, Input, Row, Col, DatePicker, Tag } from "antd";
import { includes, isEmpty, map } from "lodash";
import Helper from "src/helpers";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  Select,
  Table,
  EditableTableRow,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_TWO_COL } from "src/constants/Config";
import { reDataForTable } from "src/util/Common";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const PhieuKiemTraVatTuForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [type, setType] = useState("new");
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListLoi, setListLoi] = useState([]);
  const [ListVatTuKiemTra, setListVatTuKiemTra] = useState([]);
  const [ListPhieuNhanHang, setListPhieuNhanHang] = useState([]);
  const [editingRecord, setEditingRecord] = useState([]);
  const [id, setId] = useState(undefined);
  const [info, setInfo] = useState({});

  useEffect(() => {
    getListPhieuNhanHang();
    getListLoi();
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
        setFieldsValue({
          phieukiemtravattu: {
            ngay: moment(
              moment().format("DD/MM/YYYY HH:mm:ss"),
              "DD/MM/YYYY HH:mm:ss"
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
      if (permission && permission.edit) {
        setType("detail");
        const { id } = match.params;
        setId(id);
        getInfo(id);
      } else if (permission && !permission.edit) {
        history.push("/home");
      }
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListPhieuNhanHang = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuKiemTraVatTu/phieu-nhan-hang-chua-co-phieu-kiem-tra`,
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
        setListPhieuNhanHang(res.data);
      } else {
        setListPhieuNhanHang([]);
      }
    });
  };

  const getListLoi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_LoiVatTu?page=-1`,
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
        setListLoi(res.data);
      } else {
        setListLoi([]);
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
          `tits_qtsx_PhieuKiemTraVatTu/${id}`,
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
          const data = res.data;
          setInfo(data);
          setFieldsValue({
            phieukiemtravattu: {
              ...data,
              ngay: moment(data.ngay, "DD/MM/YYYY HH:mm:ss"),
            },
          });
          setListVatTuKiemTra(
            data.tits_qtsx_PhieuKiemTraVatTuChiTiets &&
              JSON.parse(data.tits_qtsx_PhieuKiemTraVatTuChiTiets).map((dt) => {
                return {
                  ...dt,
                  isNgoaiQuan: dt.isNgoaiQuan === true ? "true" : "false",
                  isThongSoKyThuat:
                    dt.isThongSoKyThuat === true ? "true" : "false",
                  tits_qtsx_LoiVatTu_Id:
                    dt.tits_qtsx_LoiVatTu_Id &&
                    dt.tits_qtsx_LoiVatTu_Id.toLowerCase(),
                };
              })
          );
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

  const handleThongTinSoLuong = (val, record, key) => {
    const ThongTinSoLuong = val.target.value;
    const editingKey = key;
    if (
      (isEmpty(ThongTinSoLuong) || Number(ThongTinSoLuong) <= 0) &&
      key === "soLuongKiemTra"
    ) {
      setFieldTouch(false);
      record.editingKey = editingKey;
      setEditingRecord([...editingRecord, record]);
      record.message = "Số lượng nhận phải là số lớn hơn 0 và bắt buộc";
    } else if (
      Number(ThongTinSoLuong) > record.soLuong &&
      key === "soLuongKiemTra"
    ) {
      setFieldTouch(false);
      record.editingKey = editingKey;
      setEditingRecord([...editingRecord, record]);
      record.message = "Số lượng kiểm tra không được lớn hơn số lượng nhận";
    } else if (
      (Number(ThongTinSoLuong) + Number(record.soLuongLoi) > record.soLuong &&
        key === "soLuongNhap") ||
      (Number(ThongTinSoLuong) + Number(record.soLuongNhap) > record.soLuong &&
        key === "soLuongLoi")
    ) {
      setFieldTouch(false);
      record.editingKey = editingKey;
      setEditingRecord([...editingRecord, record]);
      record.message =
        "Tổng số lượng nhập và số lượng lỗi không được lớn hơn số lượng nhận";
    } else {
      const newData = editingRecord.filter(
        (d) =>
          d.tits_qtsx_PhieuNhanHangChiTiet_Id.toLowerCase() !==
          record.tits_qtsx_PhieuNhanHangChiTiet_Id.toLowerCase()
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...ListVatTuKiemTra];
    newData.forEach((listvattu, index) => {
      if (
        listvattu.tits_qtsx_PhieuNhanHangChiTiet_Id.toLowerCase() ===
        record.tits_qtsx_PhieuNhanHangChiTiet_Id.toLowerCase()
      ) {
        if (key === "soLuongKiemTra") {
          listvattu.editingKey = editingKey;
          listvattu.soLuongKiemTra = ThongTinSoLuong;
        }
        if (key === "soLuongNhap") {
          listvattu.editingKey = editingKey;
          listvattu.soLuongNhap = ThongTinSoLuong;
        }
        if (key === "soLuongLoi") {
          listvattu.editingKey = editingKey;
          listvattu.soLuongLoi = ThongTinSoLuong;
        }
      }
    });
    setListVatTuKiemTra(newData);
  };

  const renderThongTinSoLuong = (record, key) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (
        ct.tits_qtsx_PhieuNhanHangChiTiet_Id.toLowerCase() ===
          record.tits_qtsx_PhieuNhanHangChiTiet_Id.toLowerCase() &&
        key === ct.editingKey
      ) {
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
          value={record[key]}
          disabled={
            type === "detail" ||
            (key === "soLuongLoi" &&
            record.isThongSoKyThuat === "true" &&
            record.isNgoaiQuan === "true"
              ? true
              : false)
          }
          onChange={(val) => handleThongTinSoLuong(val, record, key)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

  const handleThongTinDatTinh = (value, record, key) => {
    setListVatTuKiemTra((prevListVatTuKiemTra) => {
      return prevListVatTuKiemTra.map((item) => {
        if (
          record.tits_qtsx_PhieuNhanHangChiTiet_Id.toLowerCase() ===
          item.tits_qtsx_PhieuNhanHangChiTiet_Id.toLowerCase()
        ) {
          if (key === "isNgoaiQuan") {
            return {
              ...item,
              isNgoaiQuan: value,
            };
          } else if (key === "isThongSoKyThuat") {
            return {
              ...item,
              isThongSoKyThuat: value,
            };
          } else if (key === "tits_qtsx_LoiVatTu_Id") {
            return {
              ...item,
              tits_qtsx_LoiVatTu_Id: value,
            };
          }
        }
        return item;
      });
    });
  };

  const renderThongTinDatTinh = (record, key) => {
    return (
      <Select
        className="heading-select slt-search th-select-heading"
        data={
          key === "tits_qtsx_LoiVatTu_Id"
            ? ListLoi
              ? ListLoi
              : []
            : [
                { isKey: "true", value: "Đạt" },
                { isKey: "false", value: "Không đạt" },
              ]
        }
        placeholder={
          key === "tits_qtsx_LoiVatTu_Id" ? "Chọn loại lỗi" : "Chọn loại"
        }
        optionsvalue={
          key === "tits_qtsx_LoiVatTu_Id"
            ? ["id", "tenLoiVatTu"]
            : ["isKey", "value"]
        }
        style={{ width: "100%" }}
        onSelect={(value) => handleThongTinDatTinh(value, record, key)}
        value={record[key]}
        disabled={
          type === "detail" ||
          (key === "tits_qtsx_LoiVatTu_Id" &&
          record.isThongSoKyThuat === "true" &&
          record.isNgoaiQuan === "true"
            ? true
            : false)
        }
      />
    );
  };

  const handleMoTa = (val, record) => {
    const newData = [...ListVatTuKiemTra];
    newData.forEach((listvattu, index) => {
      if (
        listvattu.tits_qtsx_PhieuNhanHangChiTiet_Id.toLowerCase() ===
        record.tits_qtsx_PhieuNhanHangChiTiet_Id.toLowerCase()
      ) {
        listvattu.moTa = val.target.value;
      }
    });
    setListVatTuKiemTra(newData);
  };

  const renderMoTa = (record) => {
    return (
      <Input
        style={{
          textAlign: "center",
          width: "100%",
        }}
        className={`input-item`}
        value={record.moTa}
        disabled={type === "new" || type === "edit" ? false : true}
        onChange={(val) => handleMoTa(val, record)}
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
      title: "SL nhận",
      dataIndex: "soLuong",
      key: "soLuong",
      width: 100,
      align: "center",
    },
    {
      title: "SL kiểm tra",
      key: "soLuongKiemTra",
      align: "center",
      width: 100,
      render: (record) => renderThongTinSoLuong(record, "soLuongKiemTra"),
    },
    {
      title: "Đặt tính kiểm tra",
      children: [
        {
          title: "Ngoại quan",
          key: "isNgoaiQuan",
          align: "center",
          width: 150,
          render: (record) => renderThongTinDatTinh(record, "isNgoaiQuan"),
        },
        {
          title: "TS kỹ thuật",
          key: "isThongSoKyThuat",
          align: "center",
          width: 150,
          render: (record) => renderThongTinDatTinh(record, "isThongSoKyThuat"),
        },
      ],
    },
    {
      title: "Kết quả kiểm tra",
      children: [
        {
          title: "SL lỗi",
          key: "soLuongLoi",
          align: "center",
          width: 100,
          render: (record) => renderThongTinSoLuong(record, "soLuongLoi"),
        },
        {
          title: "SL nhập",
          key: "soLuongNhap",
          align: "center",
          width: 100,
          render: (record) => renderThongTinSoLuong(record, "soLuongNhap"),
        },
      ],
    },
    {
      title: "Nội dung lỗi",
      key: "tits_qtsx_LoiVatTu_Id",
      align: "center",
      width: 150,
      render: (record) =>
        renderThongTinDatTinh(record, "tits_qtsx_LoiVatTu_Id"),
    },
    {
      title: "Ghi chú",
      key: "moTa",
      align: "center",
      width: 150,
      render: (record) => renderMoTa(record),
    },
  ];
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const handleSave = (row) => {
    const newData = [...ListVatTuKiemTra];
    const index = newData.findIndex(
      (item) =>
        row.tits_qtsx_PhieuNhanHangChiTiet_Id.toLowerCase() ===
        item.tits_qtsx_PhieuNhanHangChiTiet_Id.toLowerCase()
    );
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setFieldTouch(true);
    setListVatTuKiemTra(newData);
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
    saveData(values.phieukiemtravattu);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (ListVatTuKiemTra.length === 0) {
          Helper.alertError("Danh sách vật tư rỗng");
        } else {
          saveData(values.phieukiemtravattu, val);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (phieukiemtravattu, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...phieukiemtravattu,
        ngay: phieukiemtravattu.ngay.format("DD/MM/YYYY HH:mm:ss"),
        tits_qtsx_PhieuKiemTraVatTuChiTiets: ListVatTuKiemTra.map((data) => {
          return {
            ...data,
            tits_qtsx_PhieuNhanHangChiTiet_Id: data.id,
            soLuong: data.soLuong && parseFloat(data.soLuong),
            soLuongKiemTra:
              data.soLuongKiemTra && parseFloat(data.soLuongKiemTra),
            soLuongNhap: data.soLuongNhap && parseFloat(data.soLuongNhap),
            soLuongLoi: data.soLuongLoi && parseFloat(data.soLuongLoi),
            isThongSoKyThuat: data.isThongSoKyThuat === "true" ? true : false,
            isNgoaiQuan: data.isNgoaiQuan === "true" ? true : false,
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuKiemTraVatTu`,
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
              setListVatTuKiemTra([]);
              setFieldsValue({
                phieukiemtravattu: {
                  ngay: moment(
                    moment().format("DD/MM/YYYY HH:mm:ss"),
                    "DD/MM/YYYY HH:mm:ss"
                  ),
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
        ...phieukiemtravattu,
        id: id,
        tits_qtsx_PhieuNhanHang_Id: info.tits_qtsx_PhieuNhanHang_Id,
        ngay: phieukiemtravattu.ngay.format("DD/MM/YYYY HH:mm:ss"),
        tits_qtsx_PhieuKiemTraVatTuChiTiets: ListVatTuKiemTra.map((data) => {
          return {
            ...data,
            soLuong: data.soLuong && parseFloat(data.soLuong),
            soLuongKiemTra:
              data.soLuongKiemTra && parseFloat(data.soLuongKiemTra),
            soLuongNhap: data.soLuongNhap && parseFloat(data.soLuongNhap),
            soLuongLoi: data.soLuongLoi && parseFloat(data.soLuongLoi),
            isThongSoKyThuat: data.isThongSoKyThuat === "true" ? true : false,
            isNgoaiQuan: data.isNgoaiQuan === "true" ? true : false,
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuKiemTraVatTu/${id}`,
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

  const hanldeSelectPhieu = (value) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuNhanHang/${value}`,
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
          const data =
            res.data.chiTiet_NhanHangs &&
            JSON.parse(res.data.chiTiet_NhanHangs).map((data) => {
              return {
                ...data,
                soLuongKiemTra: data.soLuong,
                soLuongNhap: data.soLuong,
                soLuongLoi: 0,
                tits_qtsx_PhieuNhanHangChiTiet_Id: data.id,
                isThongSoKyThuat: "true",
                isNgoaiQuan: "true",
              };
            });
          setListVatTuKiemTra(data);
        } else {
          setListVatTuKiemTra([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu kiểm tra vật tư "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu kiểm tra vật tư"
    ) : (
      <span>
        Chi tiết phiếu kiểm tra vật tư -{" "}
        <Tag color="blue" style={{ fontSize: "14px" }}>
          {info.maPhieu}
        </Tag>
      </span>
    );

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin phiếu kiểm tra vật tư"}
      >
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
                label="Số phiếu kiểm tra"
                name={["phieukiemtravattu", "soPhieuKiemTra"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input
                  placeholder="Nhập số phiếu kiểm tra"
                  disabled={type === "detail" ? true : false}
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
              {type === "new" ? (
                <FormItem
                  label="Mã phiếu nhận hàng"
                  name={["phieukiemtravattu", "tits_qtsx_PhieuNhanHang_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListPhieuNhanHang}
                    placeholder="Chọn mã phiếu mua hàng"
                    optionsvalue={["tits_qtsx_PhieuNhanHang_Id", "maPhieu"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    onSelect={hanldeSelectPhieu}
                    disabled={type === "new" ? false : true}
                  />
                </FormItem>
              ) : (
                <FormItem
                  label="Mã phiếu nhận hàng"
                  name={["phieukiemtravattu", "maPhieuNhanHang"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input className="input-item" disabled={true} />
                </FormItem>
              )}
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
                label="Ngày kiểm tra"
                name={["phieukiemtravattu", "ngay"]}
              >
                <DatePicker
                  format={"DD/MM/YYYY HH:mm:ss"}
                  showTime
                  allowClear={false}
                  disabled={type === "detail" ? true : false}
                />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Card>
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Danh sách vật tư"}
        headStyle={{
          textAlign: "center",
          backgroundColor: "#0469B9",
          color: "#fff",
        }}
      >
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1400, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(ListVatTuKiemTra)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          // loading={loading}
        />
      </Card>
      {type === "new" || type === "edit" ? (
        <FormSubmit
          goBack={goBack}
          handleSave={saveAndClose}
          saveAndClose={saveAndClose}
          disabled={fieldTouch}
        />
      ) : null}
    </div>
  );
};

export default PhieuKiemTraVatTuForm;
