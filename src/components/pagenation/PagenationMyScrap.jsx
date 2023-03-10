import { ConfigProvider, Pagination } from 'antd';
import React from 'react';

const PagenationMyScrap = ({ userBookmark, handleChange }) => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#000000',
        colorText: '#FEFF80',
      },
    }}
  >
    <Pagination
      total={userBookmark ? userBookmark.length : 0}
      onChange={handleChange}
      defaultCurrent={1}
      defaultPageSize={2}
    />
  </ConfigProvider>
);

export default PagenationMyScrap;
