import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Image, Input, Row, Switch } from "antd";
import { map } from "lodash";
import includes from "lodash/includes";
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
  DEFAULT_FORM_ADD_2COL_150PX,
  HINHTHUCDAOTAO_TUHOC,
} from "src/constants/Config";
import { getTokenInfo, getLocalStorage, reDataForTable } from "src/util/Common";
import ModalThemCauHoi from "./ModalThemCauHoi";
import Helpers from "src/helpers";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;
const { TextArea } = Input;

const NganHangDeThiForm = ({ history, match, permission }) => {
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
  const [ListChuyenDeDaoTao, setListChuyenDeDaoTao] = useState([]);
  const [ListCauHoi, setListCauHoi] = useState([]);
  const [ChuyenDe, setChuyenDe] = useState(null);
  const [ActiveModalThemCauHoi, setActiveModalThemCauHoi] = useState(false);
  const [id, setId] = useState(null);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
        getListChuyenDeDaoTao();
        setFieldsValue({
          formdethi: {
            isSuDung: true,
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

  const getListChuyenDeDaoTao = () => {
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
          const newData = res.data
            .filter(
              (data) =>
                data.vptq_lms_HinhThucDaoTao_Id.toLowerCase() !==
                  HINHTHUCDAOTAO_TUHOC && data.isSuDung === true
            )
            .map((dt) => {
              return {
                ...dt,
                chuyenDe: `${dt.tenChuyenDeDaoTao} (${dt.tenHinhThucDaoTao})`,
              };
            });
          setListChuyenDeDaoTao(newData);
        } else {
          setListChuyenDeDaoTao([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_DeThi/${id}?donViHienHanh_Id=${INFO.donVi_Id}`,
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
          getListChuyenDeDaoTao();
          setChuyenDe(data.vptq_lms_ChuyenDeDaoTao_Id);
          setFieldsValue({
            formdethi: data,
          });
          setListCauHoi(data.list_ChiTiets);
        }
      })
      .catch((error) => console.error(error));
  };

  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.noiDung, "câu hỏi");
  };

  const deleteItemAction = (item) => {
    const newDanhSach = ListCauHoi.filter((ds) => ds.noiDung !== item.noiDung);
    setListCauHoi(newDanhSach);
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
      title: "Nội dung câu hỏi",
      dataIndex: "noiDung",
      key: "noiDung",
      align: "left",
      width: 300,
    },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      width: 150,
      render: (value) =>
        value && (
          <span>
            <Image
              src={BASE_URL_API + value}
              alt="Hình ảnh"
              style={{ maxWidth: 70, maxHeight: 70 }}
            />
          </span>
        ),
    },
    {
      title: "Âm thanh/Video",
      dataIndex: "video",
      key: "video",
      align: "center",
      width: 150,
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
    saveData(values.formdethi);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.formdethi, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (formdethi, saveQuit = false) => {
    if (ListCauHoi.length === 0) {
      Helpers.alertError("Danh sách câu hỏi không được trống");
    } else {
      const newData = {
        ...formdethi,
        isSuDung: formdethi.isSuDung ? formdethi.isSuDung : false,
        isDefault: formdethi.isDefault ? formdethi.isDefault : false,
        list_ChiTiets: ListCauHoi && ListCauHoi,
      };
      if (type === "new") {
        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(
              `vptq_lms_DeThi?donViHienHanh_Id=${INFO.donVi_Id}`,
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
                setListCauHoi([]);
                setFieldsValue({
                  formdethi: {
                    isSuDung: true,
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
          ...formdethi,
          id: id,
          isSuDung: formdethi.isSuDung ? formdethi.isSuDung : false,
          isDefault: formdethi.isDefault ? formdethi.isDefault : false,
          list_ChiTiets:
            ListCauHoi &&
            ListCauHoi.map((cauhoi) => {
              return {
                ...cauhoi,
                vptq_lms_CauHoi_Id: cauhoi.id,
              };
            }),
        };
        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(
              `vptq_lms_DeThi/${id}?donViHienHanh_Id=${INFO.donVi_Id}`,
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
              setFieldTouch(false);
            }
          })
          .catch((error) => console.error(error));
      }
    }
  };

  const handleThemCauHoi = (data) => {
    setListCauHoi(data);
    setFieldTouch(true);
  };

  const hanldeSelectChuyenDe = (value) => {
    setChuyenDe(value);
  };

  const formTitle = type === "new" ? "Thêm mới đề thi" : "Chỉnh sửa đề thi";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Form
          {...DEFAULT_FORM_ADD_2COL_150PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Card
            className="th-card-margin-bottom th-card-reset-margin"
            title={"Thông tin đề thi"}
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
                  label="Tên đề thi"
                  name={["formdethi", "tenDeThi"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <TextArea
                    rows={2}
                    className="input-item"
                    placeholder="Nhập tên đề thi"
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
                  label="Chuyên đề"
                  name={["formdethi", "vptq_lms_ChuyenDeDaoTao_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListChuyenDeDaoTao ? ListChuyenDeDaoTao : []}
                    placeholder="Chọn chuyên đề đào tạo"
                    optionsvalue={["id", "chuyenDe"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    onSelect={hanldeSelectChuyenDe}
                    disabled={ListCauHoi.length}
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
                  label="Thời gian làm bài"
                  name={["formdethi", "thoiGianLamBai"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    type="number"
                    className="input-item"
                    placeholder="Nhập thời gian làm bài (phút)"
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
                  label="Thang điểm"
                  name={["formdethi", "thangDiem"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    type="number"
                    className="input-item"
                    placeholder="Nhập thang điểm"
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
                  label="Tiêu chuẩn đạt"
                  name={["formdethi", "tieuChuanDat"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    type="number"
                    className="input-item"
                    placeholder="Nhập tiêu chuẩn đạt từ 1 đến 100 (%)"
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
                  label="Ghi chú"
                  name={["formdethi", "moTa"]}
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
                  label="Sử dụng"
                  name={["formdethi", "isSuDung"]}
                  valuePropName="checked"
                >
                  <Switch disabled={type !== "new"} />
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
                  label="Mặc định"
                  name={["formdethi", "isDefault"]}
                  valuePropName="checked"
                >
                  <Switch disabled={type !== "new"} />
                </FormItem>
              </Col>
            </Row>
          </Card>
          <Card
            className="th-card-margin-bottom th-card-reset-margin"
            title={"Danh sách câu hỏi"}
          >
            <div align={"end"} style={{ marginBottom: "10px" }}>
              <Button
                className="th-margin-bottom-0 btn-margin-bottom-0"
                icon={<PlusCircleOutlined />}
                onClick={() => setActiveModalThemCauHoi(true)}
                type="primary"
                disabled={!ChuyenDe}
              >
                Thêm câu hỏi
              </Button>
            </div>
            <Table
              bordered
              columns={columns}
              scroll={{ x: 1300, y: "35vh" }}
              components={components}
              className="gx-table-responsive th-table"
              dataSource={reDataForTable(ListCauHoi)}
              size="small"
              rowClassName={"editable-row"}
              pagination={false}
              loading={loading}
            />
          </Card>
          <FormSubmit
            goBack={goBack}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        </Form>
      </Card>
      <ModalThemCauHoi
        openModal={ActiveModalThemCauHoi}
        openModalFS={setActiveModalThemCauHoi}
        chuyende={ChuyenDe}
        list_cauhoi={ListCauHoi}
        DataThemCauHoi={handleThemCauHoi}
      />
    </div>
  );
};

export default NganHangDeThiForm;
