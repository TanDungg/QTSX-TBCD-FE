import { Modal as AntModal, Form, Card, Col, Divider, Image, Row } from "antd";
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useSelector, useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select } from "src/components/Common";
import { BASE_URL_API, DEFAULT_FORM_ADD_150PX } from "src/constants/Config";
import { convertObjectToUrlParams } from "src/util/Common";

const FormItem = Form.Item;

function ModalThemCauHoi({
  openModalFS,
  openModal,
  chuyende,
  list_cauhoi,
  DataThemCauHoi,
}) {
  const { width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields } = form;
  const [ListCauHoi, setListCauHoi] = useState([]);
  const [CauHoi, setCauHoi] = useState(null);

  useEffect(() => {
    if (openModal) {
      getListCauHoi(chuyende);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListCauHoi = (vptq_lms_ChuyenDeDaoTao_Id) => {
    const param = convertObjectToUrlParams({
      vptq_lms_ChuyenDeDaoTao_Id,
      isSuDung: true,
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_CauHoi?${param}`,
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
          if (list_cauhoi.length) {
            const newListCauHoi = res.data.filter((dt) => {
              const findcauhoi = list_cauhoi.find(
                (ch) =>
                  ch.vptq_lms_CauHoi_Id.toLowerCase() === dt.id.toLowerCase()
              );
              return !findcauhoi;
            });

            setListCauHoi(newListCauHoi);
          } else {
            setListCauHoi(res.data);
          }
        } else {
          setListCauHoi([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const onFinish = (values) => {
    ThemCauHoi(values.modalthemcauhoi);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        ThemCauHoi(values.modalthemcauhoi, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const ThemCauHoi = (modalthemcauhoi, saveQuit = false) => {
    DataThemCauHoi({
      ...modalthemcauhoi,
      ...(CauHoi && CauHoi),
    });
    resetFields();
    setCauHoi(null);

    const listcauhoi = ListCauHoi.filter((ch) => ch.id !== CauHoi.id);
    setListCauHoi(listcauhoi);

    setFieldTouch(false);
    if (saveQuit) {
      handleCancel();
    }
  };

  const hanldeSelectCauHoi = (value) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_CauHoi/${value}`,
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
        setCauHoi(res.data);
      } else {
        setCauHoi(null);
      }
    });
  };

  const handleCancel = () => {
    resetFields();
    setFieldTouch(false);
    openModalFS(false);
  };

  return (
    <AntModal
      title="Thêm câu hỏi"
      open={openModal}
      width={width > 1000 ? `60%` : `100%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Card
        className="th-card-margin-bottom"
        align="center"
        style={{ width: "100%" }}
      >
        <Form
          {...DEFAULT_FORM_ADD_150PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Col xxl={18} xl={20} lg={22} xs={24}>
            <FormItem
              label="Nội dung câu hỏi"
              name={["modalthemcauhoi", "vptq_lms_CauHoi_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListCauHoi ? ListCauHoi : []}
                placeholder="Chọn câu hỏi"
                optionsvalue={["id", "noiDung"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
                onSelect={hanldeSelectCauHoi}
              />
            </FormItem>
          </Col>
          {CauHoi ? (
            <Card
              className="th-card-margin-bottom th-card-reset-margin"
              align="left"
            >
              <Row>
                <Col
                  span={24}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      width: "70px",
                      fontWeight: "bold",
                    }}
                  >
                    Câu hỏi:
                  </span>
                  <span
                    style={{
                      width: "calc(100% - 70px)",
                    }}
                  >
                    {CauHoi.noiDung}
                  </span>
                </Col>
                {CauHoi.hinhAnh && (
                  <Col
                    lg={12}
                    xs={24}
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      src={BASE_URL_API + CauHoi.hinhAnh}
                      alt="Hình ảnh"
                      style={{ maxWidth: "120px", maxHeight: "120px" }}
                    />
                  </Col>
                )}
                {CauHoi.video && (
                  <Col
                    lg={12}
                    xs={24}
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {CauHoi.video.endsWith(".mp4") ? (
                      <ReactPlayer
                        style={{ cursor: "pointer" }}
                        url={BASE_URL_API + CauHoi.video}
                        width="200px"
                        height="120px"
                        playing={true}
                        muted={true}
                        controls={false}
                        onClick={() => {
                          window.open(BASE_URL_API + CauHoi.video, "_blank");
                        }}
                      />
                    ) : (
                      <a
                        target="_blank"
                        href={BASE_URL_API + CauHoi.video}
                        rel="noopener noreferrer"
                      >
                        {CauHoi.video.split("/")[5]}
                      </a>
                    )}
                  </Col>
                )}
              </Row>
              <Divider
                orientation="left"
                backgroundColor="none"
                style={{
                  color: "#0469b9",
                  background: "none",
                  fontWeight: "bold",
                }}
              >
                Đáp án
              </Divider>
              <Row gutter={[0, 10]}>
                {CauHoi.list_ChiTiets &&
                  CauHoi.list_ChiTiets.length &&
                  CauHoi.list_ChiTiets.map((dapan, index) => {
                    return (
                      <Col
                        span={24}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          fontWeight: dapan.isCorrect && "bold",
                          backgroundColor: dapan.isCorrect && "#A9FABF",
                          color: dapan.isCorrect && "#0469b9",
                        }}
                      >
                        <span
                          style={{
                            width: "30px",
                            fontWeight: "bold",
                          }}
                        >
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {CauHoi && (
                          <span
                            style={{
                              width: "calc(100% - 30px)",
                            }}
                          >
                            {dapan.dapAn}
                          </span>
                        )}
                      </Col>
                    );
                  })}
              </Row>
            </Card>
          ) : null}
          <FormSubmit
            goBack={handleCancel}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        </Form>
      </Card>
    </AntModal>
  );
}

export default ModalThemCauHoi;
