import React, { useEffect, useState } from "react";
import { PageHeader, Descriptions, Card } from "antd";
import { useDispatch } from "react-redux";

import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { getTokenInfo } from "src/util/Common";

function TaiKhoan() {
  const dispatch = useDispatch();
  const [data, setData] = useState();
  useEffect(() => {
    getInfo();
    return () => dispatch(fetchReset());
  }, []);
  const getInfo = () => {
    const userInfo = getTokenInfo();
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/cbnv/${userInfo.id}`,
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
          setData(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <Card>
      <PageHeader title="Thông tin tài khoản" subTitle="Chi tiết">
        <Descriptions>
          <Descriptions.Item label="Email">
            <strong>{data && data.email}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Họ tên">
            <strong>{data && data.fullName}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Chức vụ">
            <strong>{data && data.tenChucVu}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Bộ phận">
            <strong>{data && data.tenBoPhan}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Phòng ban" span={2}>
            <strong>{data && data.tenPhongBan}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Đơn vị">
            <strong>{data && data.tenDonVi}</strong>
          </Descriptions.Item>
        </Descriptions>
      </PageHeader>
    </Card>
  );
}

export default TaiKhoan;
