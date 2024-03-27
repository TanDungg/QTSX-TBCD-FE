import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, Card, Col, DatePicker, Form, Input, Row } from "antd";
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
import { DEFAULT_FORM_ADD_2COL_180PX } from "src/constants/Config";
import { getTokenInfo, getLocalStorage, reDataForTable } from "src/util/Common";
import ModalThemNoiDung from "./ModalThemNoiDung";
import numeral from "numeral";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;
const NoiDungChiPhi = [
  {
    tenNoiDungChiPhi: "Giá vật tư thép",
    donGiaNhaMay: "4834246",
    donGiaTheoPO: "4834246",
    moTa: "ghiChu",
  },
  {
    tenNoiDungChiPhi: "Giá vật tư mua ngoài",
    donGiaNhaMay: "7523032",
    donGiaTheoPO: "7523032",
    moTa: "ghiChu",
  },
  {
    tenNoiDungChiPhi: "Chi phí sản xuất ",
    donGiaNhaMay: "956052",
    donGiaTheoPO: "956052",
    moTa: "ghiChu",
  },
];

const BaoGiaForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [type, setType] = useState("new");
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListDonViTinh, setListDonViTinh] = useState([]);
  const [ListNoiDungChiPhi, setListNoiDungChiPhi] = useState([]);
  const [ActiveModalThemNoiDung, setActiveModalThemNoiDung] = useState(false);
  const [id, setId] = useState(null);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
        getListDonViTinh();
        setListNoiDungChiPhi(NoiDungChiPhi);
        setFieldsValue({
          formbaogia: {
            thoiGianLapPhieu: moment(
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
        // Get info
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

  const getListDonViTinh = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonViTinh?DonVi_Id=${INFO.donVi_Id}&page=-1`,
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
          setListDonViTinh(res.data);
        } else {
          setListDonViTinh([]);
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
          setFieldsValue({
            formbaogia: res.data,
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
    saveData(values.formbaogia);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.formbaogia, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (formbaogia, saveQuit = false) => {
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tsec_qtsx_PhieuYeuCauBaoGia`,
            "POST",
            formbaogia,
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
      var newData = { ...formbaogia, id: id };
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
                  name={["formbaogia", "tenPhieuBaoGia"]}
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
                  name={["formbaogia", "qtsx_tsec_PhieuYeuCauBaoGia_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    // data={ListPhieuYeuCauBaoGia ? ListPhieuYeuCauBaoGia : []}
                    data={[
                      {
                        id: "1",
                        tenPhieuYeuCauBaoGia: "tenPhieuYeuCauBaoGiaA",
                      },
                    ]}
                    placeholder="Chọn phiếu yêu cầu báo giá"
                    optionsvalue={["id", "tenDongSanPham"]}
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
                  label="Dòng sản phẩm"
                  name={["formbaogia", "qtsx_tsec_DongSanPham_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    // data={ListDongSanPham ? ListDongSanPham : []}
                    data={[
                      {
                        id: "1",
                        tenDongSanPham: "tenDongSanPhamA",
                      },
                    ]}
                    placeholder="Chọn dòng sản phẩm"
                    optionsvalue={["id", "tenDongSanPham"]}
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
                  name={["formbaogia", "qtsx_tsec_SanPham_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    // data={ListSanPham ? ListSanPham : []}
                    data={[
                      {
                        id: "1",
                        tenSanPham: "tenSanPhamA",
                      },
                    ]}
                    placeholder="Chọn sản phẩm"
                    optionsvalue={["id", "tenSanPham"]}
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
                  name={["formbaogia", "soLuong"]}
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
                  label="Đơn vị tính"
                  name={["formbaogia", "qtsx_tsec_DonViTinh_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListDonViTinh ? ListDonViTinh : []}
                    placeholder="Chọn đơn vị tính"
                    optionsvalue={["id", "tenDonViTinh"]}
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
                  name={["formbaogia", "qtsx_tsec_VatLieu_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    // data={ListVatLieu ? ListVatLieu : []}
                    data={[
                      {
                        id: "1",
                        tenVatLieu: "tenVatLieuA",
                      },
                    ]}
                    placeholder="Chọn vật liệu"
                    optionsvalue={["id", "tenVatLieu"]}
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
                  label="Khách hàng"
                  name={["formbaogia", "qtsx_tsec_KhachHang_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    // data={ListKhachHang ? ListKhachHang : []}
                    data={[
                      {
                        id: "1",
                        tenKhachHang: "tenKhachHangA",
                      },
                    ]}
                    placeholder="Chọn đơn hàng"
                    optionsvalue={["id", "tenKhachHang"]}
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
                  label="Thời gian lập phiếu"
                  name={["formbaogia", "thoiGianLapPhieu"]}
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
                  name={["formbaogia", "moTa"]}
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
