import React from 'react';
import DownloadPreviewDialog from '@/components/DownloadPreviewDialog.jsx';
import { DOWNLOAD_ASSETS } from '@/content/downloads.js';

export default function SyllabusPreviewDialog(props) {
  return (
    <DownloadPreviewDialog
      {...props}
      asset={DOWNLOAD_ASSETS.syllabus}
      title="Financial Operations Masterclass syllabus"
      description="Review the published syllabus summary before connecting with Centaur Careers."
      triggerLabel={props.triggerLabel || 'Download syllabus summary'}
      analyticsId={props.analyticsId || 'contact-syllabus-preview'}
      analyticsIntent={props.analyticsIntent || 'commercial_program'}
    />
  );
}
