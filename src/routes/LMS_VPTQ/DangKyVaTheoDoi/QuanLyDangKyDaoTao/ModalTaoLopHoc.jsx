import { DeleteOutlined } from "@ant-design/icons";
import {
  Modal as AntModal,
  Form,
  Card,
  Col,
  Row,
  Input,
  DatePicker,
  Switch,
} from "antd";
import dayjs from "dayjs";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  ModalDeleteConfirm,
  Select,
  Table,
} from "src/components/Common";
import {
  HINHTHUCDAOTAO_ONLINE,
  DEFAULT_FORM_ADD_2COL_200PX,
  DONVI_VPTQ,
  HINHTHUCDAOTAO_TUHOC,
} from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  reDataForTable,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";

const FormItem = Form.Item;

function ModalTaoLopHoc({ openModalFS, openModal, dataTaoLopHoc, refesh }) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListUserDuyet, setListUserDuyet] = useState([]);
  const [ListCBNV, setListCBNV] = useState([]);
  const [ListDeThi, setListDeThi] = useState([]);
  const [isThi, setIsThi] = useState(false);

  useEffect(() => {
    if (openModal) {
      getListUserDuyet();
      getListDeThi(dataTaoLopHoc.vptq_lms_ChuyenDeDaoTao_Id);
      setListCBNV(dataTaoLopHoc.list_ChiTiets);
      setFieldsValue({
        modaltaolophoc: {
          tenChuyenDeDaoTao: dataTaoLopHoc.tenChuyenDeDaoTao,
          tenHinhThucDaoTao: dataTaoLopHoc.tenHinhThucDaoTao,
          thoiGianDaoTao: moment(
            moment().add(1, "day").format("DD/MM/YYYY HH:mm"),
            "DD/MM/YYYY HH:mm"
          ),
          thoiGianKetThuc: moment(getDateNow(1), "DD/MM/YYYY"),
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListUserDuyet = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/get-cbnv?donviId=${DONVI_VPTQ}&key=1`,
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
        const dethi = res.data.find((dt) => dt.isDefault === true);
        setFieldsValue({
          modaltaolophoc: {
            vptq_lms_DeThi_Id: dethi && dethi.id,
          },
        });
        const newData = res.data.filter((data) => data.isSuDung === true);
        setListDeThi(newData);
      } else {
        setListDeThi([]);
      }
    });
  };

  const actionContent = (item) => {
    const deleteItemVal = { onClick: () => deleteItemFunc(item) };

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

    setListCBNV(listnhanvien);
    setFieldTouch(true);
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

  const onFinish = (values) => {
    saveData(values.modaltaolophoc);
  };

  const saveData = (modaltaolophoc) => {
    const newData = {
      ...modaltaolophoc,
      ...dataTaoLopHoc,
      thoiGianDaoTao: modaltaolophoc.thoiGianDaoTao.format("DD/MM/YYYY HH:mm"),
      thoiGianKetThuc: modaltaolophoc.thoiGianKetThuc.format("DD/MM/YYYY"),
    };
    console.log(newData);
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_LopHoc`,
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
          setFieldTouch(false);
          resetFields();
          setIsThi(false);
          setListDeThi([]);
          setListCBNV([]);
          handleCancel();
          refesh();
        } else {
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
  };

  const handleCancel = () => {
    openModalFS(false);
  };

  return (
    <AntModal
      title="TẠO LỚP HỌC"
      open={openModal}
      width={width >= 1600 ? `80%` : `100%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Form
        {...DEFAULT_FORM_ADD_2COL_200PX}
        form={form}
        name="nguoi-dung-control"
        onFinish={onFinish}
        onFieldsChange={() => setFieldTouch(true)}
      >
        <Card className="th-card-margin-bottom" bodyStyle={{ padding: "15px" }}>
          <Row align={width >= 1600 ? "" : "center"} style={{ width: "100%" }}>
            <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
              <FormItem
                label="Tên lớp học"
                name={["modaltaolophoc", "tenLopHoc"]}
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
                <Input className="input-item" placeholder="Nhập tên lớp học" />
              </FormItem>
            </Col>
            <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
              <FormItem
                label="Chuyên đề đào tạo"
                name={["modaltaolophoc", "tenChuyenDeDaoTao"]}
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
                name={["modaltaolophoc", "tenHinhThucDaoTao"]}
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
                name={["modaltaolophoc", "thoiGianDaoTao"]}
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
                name={["modaltaolophoc", "thoiGianKetThuc"]}
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
            {dataTaoLopHoc &&
            dataTaoLopHoc.vptq_lms_HinhThucDaoTao_Id !==
              HINHTHUCDAOTAO_ONLINE ? (
              <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                <FormItem
                  label="Địa điểm đào tạo"
                  name={["modaltaolophoc", "diaDiem"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập địa điểm đào tạo"
                  />
                </FormItem>
              </Col>
            ) : null}
            {dataTaoLopHoc &&
            dataTaoLopHoc.vptq_lms_HinhThucDaoTao_Id !==
              HINHTHUCDAOTAO_TUHOC ? (
              <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                <FormItem
                  label="Thi khảo sát"
                  name={["modaltaolophoc", "isThi"]}
                  valuePropName="checked"
                >
                  <Switch onChange={handleSwitchChange} />
                </FormItem>
              </Col>
            ) : null}
            {isThi ? (
              <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                <FormItem
                  label="Đề thi"
                  name={["modaltaolophoc", "vptq_lms_DeThi_Id"]}
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
                name={["modaltaolophoc", "nguoiDuyet_Id"]}
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
                name={["modaltaolophoc", "moTa"]}
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
          bodyStyle={{ padding: "15px" }}
        >
          <Table
            bordered
            scroll={{ x: 1200, y: "20vh" }}
            columns={colValues}
            className="gx-table-responsive th-table"
            dataSource={reDataForTable(ListCBNV)}
            size="small"
            pagination={false}
            // loading={loading}
          />
        </Card>
        <FormSubmit
          goBack={handleCancel}
          disabled={fieldTouch && ListCBNV.length !== 0}
        />
      </Form>
    </AntModal>
  );
}

export default ModalTaoLopHoc;
