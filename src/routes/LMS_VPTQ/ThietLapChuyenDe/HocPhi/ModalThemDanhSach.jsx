import { Modal as AntModal, Form, Card, Input, Col } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select } from "src/components/Common";
import { DEFAULT_FORM_ADD_130PX } from "src/constants/Config";

const FormItem = Form.Item;
const { TextArea } = Input;

function ModalThemDanhSach({
  openModalFS,
  openModal,
  chitiet,
  refesh,
  DataThemDanhSach,
}) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [ListChuyenDe, setListChuyenDe] = useState(null);
  const [isChinhSua, setIsChinhSua] = useState(false);

  useEffect(() => {
    if (openModal) {
      getListChuyenDe();
      if (chitiet) {
        setIsChinhSua(true);
        setFieldsValue({
          modalthemdanhsach: chitiet,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

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

  const onFinish = (values) => {
    ThemDanhSach(values.modalthemdanhsach);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        ThemDanhSach(values.modalthemdanhsach, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const ThemDanhSach = (modalthemdanhsach, saveQuit = false) => {
    const chuyende = ListChuyenDe.find(
      (list) => list.id === modalthemdanhsach.vptq_lms_ChuyenDeDaoTao_Id
    );

    DataThemDanhSach({
      ...modalthemdanhsach,
      isChinhSua: isChinhSua,
      vptq_lms_HocPhiChiTiet_Id: chitiet && chitiet.vptq_lms_HocPhiChiTiet_Id,
      tenChuyenDeDaoTao: chuyende && chuyende.tenChuyenDeDaoTao,
    });
    resetFields();

    const listchuyende = ListChuyenDe.filter(
      (list) => list.id !== modalthemdanhsach.vptq_lms_ChuyenDeDaoTao_Id
    );
    setListChuyenDe(listchuyende);

    setFieldTouch(false);
    if (saveQuit || chitiet) {
      handleCancel();
    }
  };

  const handleCancel = () => {
    resetFields();
    setIsChinhSua(false);
    openModalFS(false);
    refesh();
  };

  return (
    <AntModal
      title="Thêm danh sách học phí theo chuyên đề"
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
          {...DEFAULT_FORM_ADD_130PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Col xxl={18} xl={20} lg={22} xs={24}>
            <FormItem
              label="Chuyên đề"
              name={["modalthemdanhsach", "vptq_lms_ChuyenDeDaoTao_Id"]}
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
              />
            </FormItem>
          </Col>
          <Col xxl={18} xl={20} lg={22} xs={24}>
            <FormItem
              label="Học phí"
              name={["modalthemdanhsach", "hocPhi"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Input
                type="number"
                className="input-item"
                placeholder="Nhập học phí (VNĐ/Học viên)"
              />
            </FormItem>
          </Col>
          <Col xxl={18} xl={20} lg={22} xs={24}>
            <FormItem
              label="Ghi chú"
              name={["modalthemdanhsach", "moTa"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <TextArea
                rows={3}
                className="input-item"
                placeholder="Nhập ghi chú"
              />
            </FormItem>
          </Col>
          {!chitiet ? (
            <FormSubmit
              goBack={handleCancel}
              saveAndClose={saveAndClose}
              disabled={fieldTouch}
            />
          ) : (
            <FormSubmit goBack={handleCancel} disabled={fieldTouch} />
          )}
        </Form>
      </Card>
    </AntModal>
  );
}

export default ModalThemDanhSach;
