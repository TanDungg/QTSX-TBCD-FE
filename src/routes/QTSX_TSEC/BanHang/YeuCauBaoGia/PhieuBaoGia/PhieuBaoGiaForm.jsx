import {
  DeleteOutlined,
  PlusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Upload,
  message,
} from "antd";
import dayjs from "dayjs";
import { map } from "lodash";
import includes from "lodash/includes";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  EditableTableRow,
  FormSubmit,
  ModalDeleteConfirm,
  Select,
  Table,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  BASE_URL_API,
  DEFAULT_FORM_ADD_2COL_180PX,
} from "src/constants/Config";
import { reDataForTable } from "src/util/Common";
import ModalThemNoiDung from "./ModalThemNoiDung";
import numeral from "numeral";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const BaoGiaForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [type, setType] = useState("new");
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListPhieuYeuCauBaoGia, setListPhieuYeuCauBaoGia] = useState([]);
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListVatLieu, setListVatLieu] = useState([]);
  const [ImageUrl, setImageUrl] = useState(null);
  const [ListNoiDungChiPhi, setListNoiDungChiPhi] = useState([]);
  const [ActiveModalThemNoiDung, setActiveModalThemNoiDung] = useState(false);
  const [id, setId] = useState(null);

  useEffect(() => {
    getListPhieuYeuCauBaoGia();
    getListSanPham();
    getListVatLieu();
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
        setFieldsValue({
          formphieubaogia: {
            thoiGianLap: moment(
              moment().format("DD/MM/YYYY HH:mm"),
              "DD/MM/YYYY HH:mm"
            ),
          },
        });
      } else if (permission && !permission.add) {
        history.push("/home");
      }
    } else {
      if (permission && permission.edit) {
        setType("edit");
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

  const getListPhieuYeuCauBaoGia = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_PhieuYeuCauBaoGia?isDuyet=true&page=-1`,
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
          const newData = res.data.map((dt) => {
            return {
              ...dt,
              phieuYeuCauBaoGia: `${dt.maPhieuYeuCauBaoGia} - ${dt.tenPhieuYeuCauBaoGia}`,
            };
          });
          setListPhieuYeuCauBaoGia(newData);
        } else {
          setListPhieuYeuCauBaoGia([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_SanPham?page=-1`,
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
          const newData = res.data.map((dt) => {
            return {
              ...dt,
              sanPham: `${dt.maSanPham} - ${dt.tenSanPham}`,
            };
          });
          setListSanPham(newData);
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListVatLieu = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_VatLieu?page=-1`,
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
          const newData = res.data.map((dt) => {
            return {
              ...dt,
              vatLieu: `${dt.maVatLieu} - ${dt.tenVatLieu}`,
            };
          });
          setListVatLieu(newData);
        } else {
          setListVatLieu([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_PhieuYeuCauBaoGia/${id}`,
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
          if (res.data.hinhAnh) {
            convertToBase64(res.data.hinhAnh);
          }

          setFieldsValue({
            formphieubaogia: res.data,
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(
      deleteItemAction,
      item,
      item.tenNoiDungChiPhi,
      "nội dung yêu cầu"
    );
  };

  const deleteItemAction = (item) => {
    // const newDanhSach = ListCauHoi.filter((ds) => ds.noiDung !== item.noiDung);
    setFieldTouch(true);
  };

  const actionContent = (item) => {
    const deleteItem = { onClick: () => deleteItemFunc(item) };

    return (
      <div>
        <React.Fragment>
          <a {...deleteItem} title="Xóa câu hỏi">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Nội dung chi phí",
      dataIndex: "tenNoiDungChiPhi",
      key: "tenNoiDungChiPhi",
      align: "left",
      width: 200,
    },
    {
      title: "Đơn giá nhà máy",
      dataIndex: "donGiaNhaMay",
      key: "donGiaNhaMay",
      align: "center",
      width: 150,
      render: (value) => {
        return <span>{numeral(value).format("0,0 VNĐ")} VNĐ</span>;
      },
    },
    {
      title: "Đơn giá theo PO",
      dataIndex: "donGiaTheoPO",
      key: "donGiaTheoPO",
      align: "center",
      width: 150,
      render: (value) => {
        return <span>{numeral(value).format("0,0 VNĐ")} VNĐ</span>;
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "left",
      width: 150,
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

  const handleThemNoiDung = (data) => {
    console.log(data);
    setListNoiDungChiPhi([...ListNoiDungChiPhi, data]);
  };

  const handleRefesh = () => {};

  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${match.params.id}/chinh-sua`,
        ""
      )}`
    );
  };

  const onFinish = (values) => {
    saveData(values.formphieubaogia);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.formphieubaogia, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (formphieubaogia, saveQuit = false) => {
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tsec_qtsx_PhieuYeuCauBaoGia`,
            "POST",
            formphieubaogia,
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
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = { ...formphieubaogia, id: id };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tsec_qtsx_PhieuYeuCauBaoGia/${id}`,
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
          if (res.status === 409 || !saveQuit) {
            setFieldTouch(false);
          } else {
            goBack();
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
      }}
      type="button"
    >
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload hình ảnh
      </div>
    </button>
  );

  const convertToBase64 = async (imageUrl) => {
    try {
      const response = await fetch(BASE_URL_API + imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64Data = reader.result;
        setImageUrl(base64Data);
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Lỗi chuyển dữ liệu sang base64:", error);
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Vui lòng tải file ảnh!");
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setImageUrl(e.target.result);
      reader.readAsDataURL(file);
    }
    return false;
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const formTitle =
    type === "new" ? "Thêm mới phiếu báo giá" : "Chỉnh sửa phiếu báo giá";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_ADD_2COL_180PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Card className="th-card-margin-bottom" title="Thông tin báo giá">
            <Row align={width >= 1600 ? "" : "center"} className="row-margin">
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Tên phiếu báo giá"
                  name={["formphieubaogia", "tenPhieuBaoGia"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                    {
                      max: 250,
                      message: "Tên phiếu báo giá không được quá 250 ký tự",
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập tên phiếu báo giá"
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Phiếu yêu cầu báo giá"
                  name={["formphieubaogia", "tsec_qtsx_PhieuYeuCauBaoGia_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListPhieuYeuCauBaoGia ? ListPhieuYeuCauBaoGia : []}
                    placeholder="Chọn phiếu yêu cầu báo giá"
                    optionsvalue={["id", "phieuYeuCauBaoGia"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Sản phẩm"
                  name={["formphieubaogia", "qtsx_tsec_SanPham_Id"]}
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
                    optionsvalue={["id", "sanPham"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Vật liệu"
                  name={["formphieubaogia", "tsec_qtsx_VatLieu_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListVatLieu ? ListVatLieu : []}
                    placeholder="Chọn vật liệu"
                    optionsvalue={["id", "vatLieu"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Số lượng"
                  name={["formphieubaogia", "soLuong"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    type="number"
                    className="input-item"
                    placeholder="Nhập số lượng sản phẩm"
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Thời gian lập"
                  name={["formphieubaogia", "thoiGianLap"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <DatePicker
                    showTime
                    format={"DD/MM/YYYY HH:mm"}
                    disabledDate={disabledDate}
                    allowClear={false}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Ghi chú"
                  name={["formphieubaogia", "moTa"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input className="input-item" placeholder="Nhập ghi chú" />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Hình ảnh"
                  name={["formphieubaogia", "hinhAnh"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Upload
                    listType="picture-card"
                    accept="image/*"
                    className="avatar-uploader"
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                  >
                    {ImageUrl ? (
                      <img
                        style={{ maxWidth: "100%", maxHeight: "100%" }}
                        src={ImageUrl}
                        alt="Hình ảnh đại diện chuyên đề"
                      />
                    ) : (
                      uploadButton
                    )}
                  </Upload>
                </FormItem>
              </Col>
            </Row>
          </Card>
          <Card
            className="th-card-margin-bottom"
            title={"Thông tin danh sách chi phí báo giá"}
          >
            <div align={"end"} style={{ marginBottom: "10px" }}>
              <Button
                className="th-margin-bottom-0 btn-margin-bottom-0"
                icon={<PlusCircleOutlined />}
                onClick={() => setActiveModalThemNoiDung(true)}
                type="primary"
              >
                Thêm nội dung chi phí
              </Button>
            </div>
            <Table
              bordered
              columns={columns}
              scroll={{ x: 1000, y: "35vh" }}
              components={components}
              className="gx-table-responsive th-table"
              dataSource={reDataForTable(ListNoiDungChiPhi)}
              size="small"
              rowClassName={"editable-row"}
              pagination={false}
            />
          </Card>
          <FormSubmit
            goBack={goBack}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        </Form>
      </Card>
      <ModalThemNoiDung
        openModal={ActiveModalThemNoiDung}
        openModalFS={setActiveModalThemNoiDung}
        refesh={handleRefesh}
        DataThemNoiDung={handleThemNoiDung}
      />
    </div>
  );
};

export default BaoGiaForm;
