import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Progress,
  Row,
  Upload,
} from "antd";
import { map } from "lodash";
import includes from "lodash/includes";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  ModalDeleteConfirm,
  Select,
  Table,
  EditableTableRow,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  BASE_URL_API,
  DEFAULT_FORM_ADD_2COL_130PX,
} from "src/constants/Config";
import Helpers from "src/helpers";
import {
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import ModalThemDanhSach from "./ModalThemDanhSach";
import numeral from "numeral";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const HocPhiForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const { width, loading } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [ListDonViDaoTao, setListDonViDaoTao] = useState([]);
  const [FileDinhKem, setFileDinhKem] = useState(null);
  const [DisableUpload, setDisableUpload] = useState(false);
  const [ListDanhSach, setListDanhSach] = useState([]);
  const [ChiTiet, setChiTiet] = useState(null);
  const [ActiveModalDanhSach, setActiveModalDanhSach] = useState(false);
  const [id, setId] = useState(null);
  const [Loading, setLoading] = useState(null);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
        getListDonViDaoTao();
        setFieldsValue({
          formhocphi: {
            ngayApDung: moment(getDateNow(), "DD/MM/YYYY"),
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

  const getListDonViDaoTao = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_DonViDaoTao?page=-1`,
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
          setListDonViDaoTao(res.data);
        } else {
          setListDonViDaoTao([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocPhi/${id}`,
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
          getListDonViDaoTao();
          if (data.fileDinhKem) {
            setFileDinhKem(data.fileDinhKem);
            setDisableUpload(true);
          }
          setFieldsValue({
            formhocphi: {
              ...data,
              ngayApDung: moment(data.ngayApDung, "DD/MM/YYYY"),
            },
          });
          setListDanhSach(data.list_ChiTiets);
        }
      })
      .catch((error) => console.error(error));
  };

  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.tenChuyenDe, "chuyên đề");
  };

  const deleteItemAction = (item) => {
    const newDanhSach = ListDanhSach.filter(
      (ds) =>
        ds.vptq_lms_ChuyenDeDaoTao_Id.toLowerCase() !==
        item.vptq_lms_ChuyenDeDaoTao_Id.toLowerCase()
    );

    setListDanhSach(newDanhSach);
    setFieldTouch(true);
  };

  const actionContent = (item) => {
    const editItem = {
      onClick: () => {
        setActiveModalDanhSach(true);
        setChiTiet(item);
      },
    };

    const deleteItem = { onClick: () => deleteItemFunc(item) };

    return (
      <div>
        <React.Fragment>
          <a {...editItem} title="Chỉnh sửa chuyên đề">
            <EditOutlined />
          </a>
          <Divider type="vertical" />
          <a {...deleteItem} title="Xóa chuyên đề">
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
      title: "Tên chuyên đề",
      dataIndex: "tenChuyenDeDaoTao",
      key: "tenChuyenDeDaoTao",
      align: "left",
      width: 250,
    },
    {
      title: (
        <div>
          Học phí <br />
          (VNĐ/học viên)
        </div>
      ),
      dataIndex: "hocPhi",
      key: "hocPhi",
      align: "center",
      width: 150,
      render: (value) => {
        return <span>{numeral(value).format("0,0 VNĐ")} (VNĐ)</span>;
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

  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${match.params.id}/chinh-sua`,
        ""
      )}`
    );
  };

  const onFinish = (values) => {
    uploadFile(values.formhocphi);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        uploadFile(values.formhocphi, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const uploadFile = (formhocphi, saveQuit) => {
    if (
      (type === "new" && formhocphi.fileDinhKem) ||
      (type === "edit" && formhocphi.fileDinhKem && formhocphi.fileDinhKem.file)
    ) {
      const formData = new FormData();
      formData.append("file", formhocphi.fileDinhKem.file);

      const xhr = new XMLHttpRequest();

      xhr.open("POST", `${BASE_URL_API}/api/Upload`, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setLoading(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          formhocphi.fileDinhKem = data.path;
          saveData(formhocphi, saveQuit);
        } else {
          Helpers.alertError("Tải file không thành công.");
        }
      };

      xhr.onerror = () => {
        Helpers.alertError("Tải file không thành công.");
      };

      xhr.setRequestHeader("Authorization", "Bearer " + INFO.token);
      xhr.send(formData);
    } else {
      saveData(formhocphi, saveQuit);
    }
  };

  const saveData = (formhocphi, saveQuit = false) => {
    if (formhocphi.fileDinhKem) {
      const newData = {
        ...formhocphi,
        ngayApDung: formhocphi.ngayApDung.format("DD/MM/YYYY"),
        list_ChiTiets: ListDanhSach,
      };
      if (type === "new") {
        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(
              `vptq_lms_HocPhi`,
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
                setDisableUpload(false);
                setFileDinhKem(null);
                setListDanhSach([]);
                setLoading(null);
                setFieldsValue({
                  formhocphi: {
                    ngayApDung: moment(getDateNow(), "DD/MM/YYYY"),
                  },
                });
              }
            } else {
              if (saveQuit) {
                goBack();
              } else {
                setFieldTouch(false);
                setLoading(null);
              }
            }
          })
          .catch((error) => console.error(error));
      }
      if (type === "edit") {
        const newData = {
          ...formhocphi,
          id: id,
          ngayApDung: formhocphi.ngayApDung.format("DD/MM/YYYY"),
          list_ChiTiets: ListDanhSach,
        };
        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(
              `vptq_lms_HocPhi/${id}`,
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
              setLoading(null);
            }
          })
          .catch((error) => console.error(error));
      }
    } else {
      Helpers.alertError("Vui lòng tải file đính kèm lên.");
    }
  };

  const props = {
    accept: ".pdf, .doc, .docx, .ppt, .pptx, .xls, .xlsx",
    beforeUpload: (file) => {
      const allowedFileTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!allowedFileTypes.includes(file.type)) {
        Helpers.alertError(
          `${file.name} không phải là tệp PDF, Word, Excel, hoặc PowerPoint`
        );
        return false;
      } else {
        setFileDinhKem(file);
        setDisableUpload(true);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const handleThemDanhSach = (data) => {
    if (data.isChinhSua) {
      const newDanhSach = [...ListDanhSach];
      newDanhSach.forEach((list, index) => {
        if (
          list.vptq_lms_ChuyenDeDaoTao_Id.toLowerCase() ===
          data.vptq_lms_ChuyenDeDaoTao_Id.toLowerCase()
        ) {
          newDanhSach[index] = {
            ...list,
            ...data,
          };
        }
      });
      setListDanhSach(newDanhSach);
      setFieldTouch(true);
    } else {
      const chitiet = ListDanhSach.find(
        (list) =>
          list.vptq_lms_ChuyenDeDaoTao_Id.toLowerCase() ===
          data.vptq_lms_ChuyenDeDaoTao_Id.toLowerCase()
      );
      const title = (
        <span>
          Chuyên đề{" "}
          <span style={{ fontWeight: "bold", color: "red" }}>
            {data.tenChuyenDeDaoTao}
          </span>{" "}
          đã được thêm
        </span>
      );

      if (chitiet) {
        Helpers.alertError(title);
      } else {
        setListDanhSach([...ListDanhSach, data]);
        setFieldTouch(true);
      }
    }
  };

  const handleRefesh = () => {
    setChiTiet(null);
  };

  const handleViewFile = (file) => {
    if (file) {
      window.open(URL.createObjectURL(file), "_blank");
    }
  };

  const formTitle = type === "new" ? "Thêm mới học phí" : "Chỉnh sửa học phí";
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Form
          {...DEFAULT_FORM_ADD_2COL_130PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Card
            className="th-card-margin-bottom th-card-reset-margin"
            title={"Thông tin học phí đào tạo"}
          >
            <Row
              align={width >= 1600 ? "" : "center"}
              style={{ width: "100%", padding: "0px 50px" }}
            >
              <Col
                xxl={12}
                xl={16}
                lg={18}
                md={20}
                sm={22}
                xs={24}
                style={{
                  padding: "0px 30px",
                  marginBottom: "5px",
                }}
              >
                <FormItem
                  label="Tên học phí"
                  name={["formhocphi", "tenHocPhi"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                    {
                      max: 250,
                      message: "Tên thông báo học phí không được quá 250 ký tự",
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập tên thông báo học phí"
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={16}
                lg={18}
                md={20}
                sm={22}
                xs={24}
                style={{
                  padding: "0px 30px",
                  marginBottom: "5px",
                }}
              >
                <FormItem
                  label="Đơn vị đào tạo"
                  name={["formhocphi", "vptq_lms_DonViDaoTao_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListDonViDaoTao ? ListDonViDaoTao : []}
                    placeholder="Chọn đơn vị"
                    optionsvalue={["id", "tenDonViDaoTao"]}
                    style={{ width: "100%" }}
                    optionFilterProp="name"
                    showSearch
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={16}
                lg={18}
                md={20}
                sm={22}
                xs={24}
                style={{
                  padding: "0px 30px",
                  marginBottom: "5px",
                }}
              >
                <FormItem
                  label="Ngày áp dụng"
                  name={["formhocphi", "ngayApDung"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <DatePicker format={"DD/MM/YYYY"} allowClear={false} />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={16}
                lg={18}
                md={20}
                sm={22}
                xs={24}
                style={{
                  padding: "0px 30px",
                  marginBottom: "5px",
                }}
              >
                <FormItem
                  label="File đính kèm"
                  name={["formhocphi", "fileDinhKem"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  {!DisableUpload ? (
                    <Upload {...props}>
                      <Button
                        className="th-margin-bottom-0"
                        style={{
                          marginBottom: 0,
                        }}
                        icon={<UploadOutlined />}
                        disabled={type === "detail" ? true : false}
                      >
                        Tải file đính kèm
                      </Button>
                    </Upload>
                  ) : FileDinhKem && FileDinhKem.name ? (
                    <span>
                      <span
                        style={{
                          color: "#0469B9",
                          cursor: "pointer",
                          whiteSpace: "break-spaces",
                        }}
                        onClick={() => handleViewFile(FileDinhKem)}
                      >
                        {FileDinhKem.name}{" "}
                      </span>
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        disabled={
                          type === "new" || type === "edit" ? false : true
                        }
                        onClick={() => {
                          setFileDinhKem(null);
                          setDisableUpload(false);
                          setFieldsValue({
                            formhocphi: {
                              fileDinhKem: null,
                            },
                          });
                        }}
                      />
                    </span>
                  ) : (
                    <span>
                      <a
                        target="_blank"
                        href={BASE_URL_API + FileDinhKem}
                        rel="noopener noreferrer"
                        style={{
                          whiteSpace: "break-spaces",
                          wordBreak: "break-all",
                        }}
                      >
                        {FileDinhKem && FileDinhKem.split("/")[5]}{" "}
                      </a>
                      {(type === "new" || type === "edit") && (
                        <DeleteOutlined
                          style={{ cursor: "pointer", color: "red" }}
                          disabled={
                            type === "new" || type === "edit" ? false : true
                          }
                          onClick={() => {
                            setFileDinhKem(null);
                            setDisableUpload(false);
                            setFieldsValue({
                              formhocphi: {
                                fileDinhKem: null,
                              },
                            });
                          }}
                        />
                      )}
                    </span>
                  )}
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={16}
                lg={18}
                md={20}
                sm={22}
                xs={24}
                style={{
                  padding: "0px 30px",
                  marginBottom: "5px",
                }}
              >
                <FormItem
                  label="Ghi chú"
                  name={["formhocphi", "moTa"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input className="input-item" placeholder="Nhập ghi chú" />
                </FormItem>
              </Col>
              <Col span={24} align="left">
                {Loading && (
                  <Progress
                    percent={parseFloat(Loading.toFixed(2))}
                    type="line"
                  />
                )}
              </Col>
            </Row>
          </Card>
          <Card
            className="th-card-margin-bottom th-card-reset-margin"
            title={"Danh sách học phí theo chuyên đề"}
          >
            <div align={"end"} style={{ marginBottom: "10px" }}>
              <Button
                className="th-margin-bottom-0"
                icon={<PlusCircleOutlined />}
                onClick={() => setActiveModalDanhSach(true)}
                type="primary"
              >
                Thêm danh sách
              </Button>
            </div>
            <Table
              bordered
              columns={columns}
              scroll={{ x: 1000, y: "35vh" }}
              components={components}
              className="gx-table-responsive th-table"
              dataSource={reDataForTable(ListDanhSach)}
              size="small"
              rowClassName={"editable-row"}
              pagination={false}
              loading={loading}
            />
          </Card>
          <FormSubmit
            goBack={goBack}
            saveAndClose={saveAndClose}
            disabled={fieldTouch && ListDanhSach.length}
          />
        </Form>
      </Card>
      <ModalThemDanhSach
        openModal={ActiveModalDanhSach}
        openModalFS={setActiveModalDanhSach}
        chitiet={ChiTiet}
        refesh={handleRefesh}
        DataThemDanhSach={handleThemDanhSach}
      />
    </div>
  );
};

export default HocPhiForm;
