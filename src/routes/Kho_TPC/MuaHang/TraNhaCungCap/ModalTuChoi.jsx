import { Modal as AntModal, Form, Card, Input, Button, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DEFAULT_FORM_MODAL } from "src/constants/Config";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
const FormItem = Form.Item;

function ModalTuChoi({ openModalFS, openModal, itemData, refesh }) {
  const { width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue, validateFields } = form;
  const [fieldTouch, setFieldTouch] = useState(false);

  useEffect(() => {
    if (openModal) {
      console.log(itemData);
      setFieldsValue({
        modaltuchoi: {
          maPhieuTraHangNCC: itemData.maPhieuTraHangNCC,
        },
      });
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const XacNhanLyDo = () => {
    validateFields()
      .then((values) => {
        const newData = {
          id: itemData.phieuTraHangNCC_Id,
          isXacNhan: false,
          lyDoTuChoi: values.modaltuchoi.lyDoTuChoi,
        };
        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(
              `lkn_PhieuTraVatTuNCC/xac-nhan/${itemData.phieuTraHangNCC_Id}`,
              "PUT",
              newData,
              "TUCHOI",
              "",
              resolve,
              reject
            )
          );
        })
          .then((res) => {
            if (res.status !== 409) {
              resetFields();
              setFieldTouch(false);
              openModalFS(false);
              refesh();
            }
          })
          .catch((error) => console.error(error));
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const handleCancel = () => {
    openModalFS(false);
    refesh();
  };

  return (
    <AntModal
      title={`Lý do từ chối phiếu xuất kho vật tư`}
      open={openModal}
      width={width > 1000 ? `50%` : "80%"}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom">
          <Form
            {...DEFAULT_FORM_MODAL}
            form={form}
            name="nguoi-dung-control"
            onFieldsChange={() => setFieldTouch(true)}
          >
            <FormItem
              label="Mã phiếu"
              name={["modaltuchoi", "maPhieuTraHangNCC"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Input className="input-item" disabled={true} />
            </FormItem>
            <FormItem
              label="Lý do"
              name={["modaltuchoi", "lyDoTuChoi"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập lý do từ chối" />
            </FormItem>
          </Form>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              className="th-btn-margin-bottom-0"
              type="primary"
              onClick={XacNhanLyDo}
              disabled={!fieldTouch}
            >
              Xác nhận
            </Button>
          </div>
        </Card>
      </div>
    </AntModal>
  );
}

export default ModalTuChoi;
