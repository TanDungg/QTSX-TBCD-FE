import {
  DeleteOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, DatePicker, Form, Input, Row } from "antd";
import includes from "lodash/includes";
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
import { DEFAULT_FORM_ADD_2COL_200PX } from "src/constants/Config";
import ImportDanhSachCBNV from "./ImportDanhSachCBNV";
import dayjs from "dayjs";
import {
  convertObjectToUrlParams,
  getDateNow,
  reDataForTable,
} from "src/util/Common";
import moment from "moment";
import Helpers from "src/helpers";
import ModalThemDanhSachCBNV from "./ModalThemDanhSachCBNV";

const FormItem = Form.Item;

const DangKyDaoTaoForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [type, setType] = useState("new");
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListChuyenDe, setListChuyenDe] = useState([]);
  const [ListDonVi, setListDonVi] = useState([]);
  const [DonVi, setDonVi] = useState(null);
  const [ListUserDuyet, setListUserDuyet] = useState([]);
  const [ListCBNV, setListCBNV] = useState([]);
  const [id, setId] = useState(undefined);
  const [ActiveModalImportDanhSachCBNV, setActiveModalImportDanhSachCBNV] =
    useState(false);
  const [ActiveModalDanhSachCBNV, setActiveModalDanhSachCBNV] = useState(false);

  useEffect(() => {
    getListChuyenDe();
    getListDonVi();
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
        setFieldsValue({
          formdangkydaotao: {
            thoiGianDuKien: moment(getDateNow(1), "DD/MM/YYYY"),
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

  const getListChuyenDe = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ChuyenDeDaoTao?page=-1`,
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
              chuyenDe: `${dt.tenChuyenDeDaoTao} (${dt.tenHinhThucDaoTao})`,
            };
          });
          setListChuyenDe(newData);
        } else {
          setListChuyenDe([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListDonVi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonVi/don-vi-by-user`,
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
          setListDonVi(res.data);
        } else {
          setListDonVi([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListUserDuyet = (donviId) => {
    const params = convertObjectToUrlParams({
      donviId,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/get-cbnv?${params}&key=1`,
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
          setListUserDuyet(res.data);
        } else {
          setListUserDuyet([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_PhieuDangKyDaoTao/${id}`,
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
            formdangkydaotao: {
              ...res.data,
              thoiGianDuKien: moment(res.data.thoiGianDuKien, "DD/MM/YYYY"),
            },
          });
          setDonVi(res.data.donVi_Id);
          getListUserDuyet(res.data.donVi_Id);
          setListCBNV(
            res.data.list_ChiTiets && JSON.parse(res.data.list_ChiTiets)
          );
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
      title: "Mã nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      align: "center",
      width: 100,
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
      width: 120,
    },
    {
      title: "Lỗi",
      dataIndex: "ghiChuPost",
      key: "ghiChuPost",
      align: "left",
      width: 150,
    },
  ];

  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${match.params.id}/chinh-sua`,
        ""
      )}`
    );
  };

  const onFinish = (values) => {
    saveData(values.formdangkydaotao);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.formdangkydaotao, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (formdangkydaotao, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...formdangkydaotao,
        thoiGianDuKien: formdangkydaotao.thoiGianDuKien.format("DD/MM/YYYY"),
        list_ChiTiets: ListCBNV,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_PhieuDangKyDaoTao`,
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
              setDonVi(null);
              setListUserDuyet([]);
              setListCBNV([]);
              setFieldsValue({
                formdangkydaotao: {
                  thoiGianDuKien: moment(getDateNow(1), "DD/MM/YYYY"),
                },
              });
            }
          } else {
            const newData = ListCBNV.map((cbnv) => {
              const loi = res.data.find(
                (l) => l.user_Id.toLowerCase() === cbnv.user_Id.toLowerCase()
              );
              if (loi) {
                return {
                  ...cbnv,
                  ghiChuPost: loi.ghiChuPost,
                };
              } else {
                return cbnv;
              }
            });
            setListCBNV(newData);
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...formdangkydaotao,
        id: id,
        thoiGianDuKien: formdangkydaotao.thoiGianDuKien.format("DD/MM/YYYY"),
        list_ChiTiets: ListCBNV,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_PhieuDangKyDaoTao/${id}`,
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
    }
  };

  const handleOnSelectDonVi = (value) => {
    setFieldsValue({
      formdangkydaotao: {
        nguoiKiemTra_Id: null,
        nguoiDuyet_Id: null,
      },
    });
    setDonVi(value);
    getListUserDuyet(value);
  };

  const handleOnSelectChuyenDe = () => {
    const newListCBNV =
      ListCBNV &&
      ListCBNV.map((cbnv) => {
        return {
          ...cbnv,
          ghiChuPost: null,
        };
      });
    setListCBNV(newListCBNV);
  };

  const handleThemDanhSachCNBV = (data) => {
    setListCBNV([...ListCBNV, ...data]);
    setFieldTouch(true);
  };

  const handleThemDanhSach = (data) => {
    const cnbv = ListCBNV.find(
      (list) => list.user_Id.toLowerCase() === data.user_Id.toLowerCase()
    );
    const title = (
      <span>
        Nhân viên{" "}
        <span style={{ fontWeight: "bold", color: "red" }}>
          {data.fullName}
        </span>{" "}
        đã được thêm
      </span>
    );

    if (cnbv) {
      Helpers.alertError(title);
    } else {
      setListCBNV([...ListCBNV, data]);
      setFieldTouch(true);
    }
  };

  const RowStyle = (current, index) => {
    if (current.ghiChuPost && current.ghiChuPost !== null) {
      return "red-row";
    }
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const formTitle =
    type === "new" ? "Thêm mới đăng ký đào tạo" : "Chỉnh sửa đăng ký đào tạo";

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
          <Card
            className="th-card-margin-bottom"
            title={"Thông tin đăng ký đào tạo"}
          >
            <Row
              align={width >= 1600 ? "" : "center"}
              style={{ width: "100%" }}
            >
              <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                <FormItem
                  label="Tên phiếu đăng ký"
                  name={["formdangkydaotao", "tenPhieuDangKyDaoTao"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                    {
                      max: 250,
                      message: "Tên đăng ký đào tạo không được quá 250 ký tự",
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập tên đăng ký đào tạo"
                  />
                </FormItem>
              </Col>
              <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                <FormItem
                  label="Chuyên đề đào tạo"
                  name={["formdangkydaotao", "vptq_lms_ChuyenDeDaoTao_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListChuyenDe ? ListChuyenDe : []}
                    placeholder="Chọn chuyên đề đào tạo"
                    optionsvalue={["id", "chuyenDe"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                    onSelect={handleOnSelectChuyenDe}
                  />
                </FormItem>
              </Col>
              <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                <FormItem
                  label="Thời gian dự kiến"
                  name={["formdangkydaotao", "thoiGianDuKien"]}
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
                  label="Đơn vị"
                  name={["formdangkydaotao", "donVi_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListDonVi ? ListDonVi : []}
                    placeholder="Chọn đơn vị"
                    optionsvalue={["id", "tenDonVi"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                    onSelect={handleOnSelectDonVi}
                    disabled={ListCBNV.length !== 0}
                  />
                </FormItem>
              </Col>
              <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                <FormItem
                  label="Người kiểm tra"
                  name={["formdangkydaotao", "nguoiKiemTra_Id"]}
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
                    placeholder="Chọn người kiểm tra"
                    optionsvalue={["user_Id", "fullName"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                <FormItem
                  label="Người duyệt"
                  name={["formdangkydaotao", "nguoiDuyet_Id"]}
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
                    optionsvalue={["user_Id", "fullName"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                <FormItem
                  label="Mục tiêu đào tạo"
                  name={["formdangkydaotao", "mucTieu"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập mục tiêu đào tạo"
                  />
                </FormItem>
              </Col>
              <Col xxl={12} xl={16} lg={20} md={20} sm={24} xs={24}>
                <FormItem
                  label="Ghi chú"
                  name={["formdangkydaotao", "moTa"]}
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
            title={"Danh sách CBNV đăng ký đào tạo"}
            align="center"
          >
            {(type === "new" || type === "edit") && (
              <div
                style={{
                  display: width >= 576 && "flex",
                  marginBottom: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  className="th-margin-bottom-0"
                  icon={<PlusCircleOutlined />}
                  onClick={() => setActiveModalDanhSachCBNV(true)}
                  type="primary"
                  disabled={!DonVi}
                >
                  Thêm danh sách CBNV
                </Button>
                <Button
                  className="th-margin-bottom-0"
                  icon={<UploadOutlined />}
                  onClick={() => setActiveModalImportDanhSachCBNV(true)}
                  type="primary"
                  disabled={!DonVi}
                >
                  Import danh sách CBNV
                </Button>
              </div>
            )}
            <Table
              bordered
              scroll={{ x: 1400, y: "40vh" }}
              columns={colValues}
              className="gx-table-responsive th-table"
              dataSource={reDataForTable(ListCBNV)}
              rowClassName={(current, index) => RowStyle(current, index)}
              size="small"
              pagination={false}
              // loading={loading}
            />
          </Card>
          <FormSubmit
            goBack={goBack}
            saveAndClose={saveAndClose}
            disabled={fieldTouch && ListCBNV.length}
          />
        </Form>
      </Card>
      <ImportDanhSachCBNV
        openModal={ActiveModalImportDanhSachCBNV}
        openModalFS={setActiveModalImportDanhSachCBNV}
        donVi={DonVi}
        list_cbnv={ListCBNV}
        themDanhSachCBNV={handleThemDanhSachCNBV}
      />
      <ModalThemDanhSachCBNV
        openModal={ActiveModalDanhSachCBNV}
        openModalFS={setActiveModalDanhSachCBNV}
        type={type}
        donVi={DonVi}
        list_cbnv={ListCBNV}
        DataThemDanhSach={handleThemDanhSach}
      />
    </div>
  );
};

export default DangKyDaoTaoForm;
