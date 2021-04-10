export default {
  rpc: {},
  types: {
    IASSig: 'Vec<u8>',
    Identity: {
      anchor: 'TarsAnchor',
      punishment_deadline: 'u64',
      group: 'Option<AccountId>',
    },
    ISVBody: 'Vec<u8>',
    MerkleRoot: 'Vec<u8>',
    ReportSlot: 'u64',
    PKInfo: {
      code: 'TarsCode',
      anchor: 'Option<TarsAnchor>',
    },
    TarsAnchor: 'Vec<u8>',
    TarsCert: 'Vec<u8>',
    TarsCode: 'Vec<u8>',
    TarsPubKey: 'Vec<u8>',
    TarsSignature: 'Vec<u8>',
    WorkReport: {
      report_slot: 'u64',
      used: 'u64',
      free: 'u64',
      reported_files_size: 'u64',
      reported_srd_root: 'MerkleRoot',
      reported_files_root: 'MerkleRoot',
    },
  },
};
