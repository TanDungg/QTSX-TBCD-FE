import { DeleteOutlined } from "@ant-design/icons";
import { Card, Col, DatePicker, Form, Input, Row, Switch } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  ModalDeleteConfirm,
  Select,
  Table,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_ADD_2COL_200PX, DONVI_VPTQ } from "src/constants/Config";
import dayjs from "dayjs";
import {
  reDataForTable,
  getTokenInfo,
  getLocalStorage,
  convertObjectToUrlParams,
} from "src/util/Common";
import moment from "moment";
import Helpers from "src/helpers";

const FormItem = Form.Item;

const LopHocForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [form] = Form.useForm();
  const { validateFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListUserDuyet, setListUserDuyet] = useState([]);
  const [ListCBNV, setListCBNV] = useState([]);
  const [ListDeThi, setListDeThi] = useState([]);
  const [isThi, setIsThi] = useState(false);
  const [id, setId] = useState(false);

  useEffect(() => {
    const { id } = match.params;
    setId(id);
    getInfo(id);
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListUserDuyet = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/user-by-dv-pb?donVi_Id=${DONVI_VPTQ}`,
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
              user: `${dt.maNhanVien} - ${dt.fullName}`,
            };
          });
          setListUserDuyet(newData);
        } else {
          setListUserDuyet([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListDeThi = (vptq_lms_ChuyenDeDaoTao_Id) => {
    const param = convertObjectToUrlParams({
      donViHienHanh_Id: INFO.donVi_Id,
      vptq_lms_ChuyenDeDaoTao_Id,
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_DeThi?${param}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.status !== 409) {
        setListDeThi(res.data);
      } else {
        setListDeThi([]);
      }
    });
  };

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_LopHoc/${id}`,
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
          setFieldsValue({
            formlophoc: {
              ...data,
              thoiGianDaoTao: moment(data.thoiGianDaoTao, "DD/MM/YYYY HH:mm"),
              thoiGianKetThuc: moment(data.thoiGianKetThuc, "DD/MM/YYYY"),
            },
          });
          setIsThi(data.isThi);
          getListDeThi(data.vptq_lms_ChuyenDeDaoTao_Id);
          getListUserDuyet();
          setListCBNV(data.list_ChiTiets && JSON.parse(data.list_ChiTiets));
        }
      })
      .catch((error) => console.error(error));
  };

  const actionContent = (item) => {
    const deleteItemVal =
      permission && permission.del
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };

    return (
      <React.Fragment>
        <a {...deleteItemVal} title="Xóa">
          <DeleteOutlined />
        </a>
      </React.Fragment>
    );
  };

  const deleteItemFunc = async (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.fullName, "nhân viên");
  };

  const deleteItemAction = (item) => {
    const listnhanvien = ListCBNV.filter(
      (cbnv) => cbnv.user_Id.toLowerCase() !== item.user_Id.toLowerCase()
    );
    if (listnhanvien.length === 0) {
      Helpers.alertError("Danh sách học viên không được rỗng");
    } else {
      setListCBNV(listnhanvien);
      setFieldTouch(true);
    }
  };

  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
      fixed: "left",
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Mã số nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      align: "center",
      width: 120,
    },
    {
      title: "Họ & tên",
      dataIndex: "fullName",
      key: "fullName",
      align: "left",
      width: 180,
    },
    {
      title: "Ngày sinh",
      dataIndex: "ngaySinh",
      key: "ngaySinh",
      width: 100,
      align: "center",
    },
    {
      title: "Chức danh",
      dataIndex: "tenChucDanh",
      key: "tenChucDanh",
      align: "center",
      width: 120,
    },
    {
      title: "Phòng ban",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      align: "left",
      width: 200,
    },
    {
      title: "Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      align: "left",
      width: 200,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 150,
    },
  ];

  const goBack = () => {
    history.push(`${match.url.replace(`/${match.params.id}/chinh-sua`, "")}`);
  };

  const onFinish = (values) => {
    saveData(values.formlophoc);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.formlophoc, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (formlophoc, saveQuit = false) => {
    const newData = {
      ...formlophoc,
      id: id,
      thoiGianDaoTao: formlophoc.thoiGianDaoTao.format("DD/MM/YYYY HH:mm"),
      thoiGianKetThuc: formlophoc.thoiGianKetThuc.format("DD/MM/YYYY"),
      list_ChiTiets: ListCBNV,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_LopHoc/${id}`,
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
          if (res.status !== 409) {
            goBack();
          }
        } else {
          getInfo(id);
          setFieldTouch(false);
        }
      })
      .catch((error) => console.error(error));
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const handleSwitchChange = (checked) => {
    setIsThi(checked);
    setFieldsValue({
      formlophoc: {
        vptq_lms_DeThi_Id: ListDeThi.length !== 0 && ListDeThi[0].id,
      },
    });
  };

  const formTitle = "Chỉnh sửa lớp học";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_ADD_2COL_200PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Card className="th-card-margin-bottom" title={"Thông tin lớp học"}>
            <Row
              align={width >= 1600 ? "" : "center"}
              style={{ width: "100%" }}
            >
              <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                <FormItem
                  label="Tên lớp học"
                  name={["formlophoc", "tenLopHoc"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                    {
                      max: 250,
                      message: "Tên lớp học không được quá 250 ký tự",
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập tên lớp học"
                  />
                </FormItem>
              </Col>
              <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                <FormItem
                  label="Chuyên đề đào tạo"
                  name={["formlophoc", "tenChuyenDeDaoTao"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Tên chuyên đề đào tạo"
                    disabled
                  />
                </FormItem>
              </Col>
              <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                <FormItem
                  label="Hình thức đào tạo"
                  name={["formlophoc", "tenHinhThucDaoTao"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Tên hình thức đào tạo"
                    disabled
                  />
                </FormItem>
              </Col>
              <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                <FormItem
                  label="Thời gian đào tạo"
                  name={["formlophoc", "thoiGianDaoTao"]}
                  rules={[
                    {
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
              <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                <FormItem
                  label="Thời gian kết thúc"
                  name={["formlophoc", "thoiGianKetThuc"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <DatePicker
                    format={"DD/MM/YYYY"}
                    disabledDate={disabledDate}
                    allowClear={false}
                  />
                </FormItem>
              </Col>
              <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                <FormItem
                  label="Địa điểm đào tạo"
                  name={["formlophoc", "diaDiem"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập địa điểm đào tạo"
                  />
                </FormItem>
              </Col>
              <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                <FormItem
                  label="Thi khảo sát"
                  name={["formlophoc", "isThi"]}
                  valuePropName="checked"
                >
                  <Switch onChange={handleSwitchChange} />
                </FormItem>
              </Col>
              {isThi ? (
                <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                  <FormItem
                    label="Đề thi"
                    name={["formlophoc", "vptq_lms_DeThi_Id"]}
                    rules={[
                      {
                        type: "string",
                      },
                    ]}
                  >
                    <Select
                      className="heading-select slt-search th-select-heading"
                      data={ListDeThi ? ListDeThi : []}
                      placeholder="Chọn đề thi"
                      optionsvalue={["id", "tenDeThi"]}
                      style={{ width: "100%" }}
                      showSearch
                      optionFilterProp={"name"}
                      allowClear
                    />
                  </FormItem>
                </Col>
              ) : null}
              <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                <FormItem
                  label="Người duyệt"
                  name={["formlophoc", "nguoiDuyet_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListUserDuyet ? ListUserDuyet : []}
                    placeholder="Chọn người duyệt"
                    optionsvalue={["user_Id", "user"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                <FormItem
                  label="Ghi chú"
                  name={["formlophoc", "moTa"]}
                  rules={[
                    {
                      type: "string",
                    },
                    {
                      max: 250,
                      message: "Ghi chú không được quá 250 ký tự",
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
            title={"Danh sách học viên"}
            align="center"
          >
            <Table
              bordered
              scroll={{ x: 1400, y: "40vh" }}
              columns={colValues}
              className="gx-table-responsive th-table"
              dataSource={reDataForTable(ListCBNV)}
              size="small"
              pagination={false}
              // loading={loading}
            />
          </Card>
          <FormSubmit
            goBack={goBack}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        </Form>
      </Card>
    </div>
  );
};

export default LopHocForm;
