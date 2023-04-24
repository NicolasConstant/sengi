
export class ApiRoutes {
    createApp = '/api/v1/apps';
    getToken = '/oauth/token';
    getAccount = '/api/v1/accounts/{0}';
    getCustomEmojis = '/api/v1/custom_emojis';
    getCurrentAccount = '/api/v1/accounts/verify_credentials';
    getAccountFollowers = '/api/v1/accounts/{0}/followers';
    getAccountFollowing = '/api/v1/accounts/{0}/following';
    getAccountStatuses = '/api/v1/accounts/{0}/statuses';
    follow = '/api/v1/accounts/{0}/follow';
    unfollow = '/api/v1/accounts/{0}/unfollow';
    block = '/api/v1/accounts/{0}/block';
    unblock = '/api/v1/accounts/{0}/unblock';
    mute = '/api/v1/accounts/{0}/mute';
    unmute = '/api/v1/accounts/{0}/unmute';
    muteStatus = '/api/v1/statuses/{0}/mute';
    unmuteStatus = '/api/v1/statuses/{0}/unmute';
    getAccountRelationships = '/api/v1/accounts/relationships';
    searchForAccounts = '/api/v1/accounts/search';
    getBlocks = '/api/v1/blocks';
    getFavourites = '/api/v1/favourites';
    getFollowRequests = '/api/v1/follow_requests';
    authorizeFollowRequest = '/api/v1/follow_requests/{0}/authorize';
    rejectFollowRequest = '/api/v1/follow_requests/{0}/reject';
    followRemote = '/api/v1/follows';
    getInstance = '/api/v1/instance';
    getInstancev2 = '/api/v2/instance';
    uploadMediaAttachment = '/api/v1/media';
    updateMediaAttachment = '/api/v1/media/{0}';
    getMutes = '/api/v1/mutes';
    getNotifications = '/api/v1/notifications';
    getSingleNotifications = '/api/v1/notifications/{0}';
    clearNotifications = '/api/v1/notifications/clear';
    getReports = '/api/v1/reports';
    reportUser = '/api/v1/reports';
    search = '/api/v1/search';
    searchV2 = '/api/v2/search';
    getStatus = '/api/v1/statuses/{0}';
    getStatusContext = '/api/v1/statuses/{0}/context';
    getStatusCard = '/api/v1/statuses/{0}/card';
    getStatusRebloggedBy = '/api/v1/statuses/{0}/reblogged_by';
    getStatusFavouritedBy = '/api/v1/statuses/{0}/favourited_by';
    postNewStatus = '/api/v1/statuses';
    editStatus = '/api/v1/statuses/{0}';
    deleteStatus = '/api/v1/statuses/{0}';
    reblogStatus = '/api/v1/statuses/{0}/reblog';
    unreblogStatus = '/api/v1/statuses/{0}/unreblog';
    favouritingStatus = '/api/v1/statuses/{0}/favourite';
    unfavouritingStatus = '/api/v1/statuses/{0}/unfavourite';
    pinStatus = '/api/v1/statuses/{0}/pin';
    unpinStatus = '/api/v1/statuses/{0}/unpin';
    getHomeTimeline = '/api/v1/timelines/home';
    getPublicTimeline = '/api/v1/timelines/public';
    getHastagTimeline = '/api/v1/timelines/tag/{0}';
    getDirectTimeline = '/api/v1/timelines/direct';
    getTagTimeline = '/api/v1/timelines/tag/{0}';
    getListTimeline = '/api/v1/timelines/list/{0}';
    getStreaming = '/api/v1/streaming?access_token={0}&stream={1}';
    getLists = '/api/v1/lists';
    getList = '/api/v1/lists/{0}';
    getListsWithAccount = '/api/v1/accounts/{0}/lists';
    getAccountsInList = '/api/v1/lists/{0}/accounts';
    postList = '/api/v1/lists';
    putList = '/api/v1/lists/{0}';
    deleteList = '/api/v1/lists/{0}';
    addAccountToList = '/api/v1/lists/{0}/accounts';
    removeAccountFromList = '/api/v1/lists/{0}/accounts';
    voteOnPoll = '/api/v1/polls/{0}/votes';
    getPoll = '/api/v1/polls/{0}';
    getConversations = '/api/v1/conversations';
    getScheduledStatuses = '/api/v1/scheduled_statuses';
    putScheduleStatus = '/api/v1/scheduled_statuses/{0}';
    deleteScheduleStatus = '/api/v1/scheduled_statuses/{0}';
    bookmarkingStatus = '/api/v1/statuses/{0}/bookmark';
    unbookmarkingStatus = '/api/v1/statuses/{0}/unbookmark';
    getBookmarks = '/api/v1/bookmarks';
    getFollowers = '/api/v1/accounts/{0}/followers';
    getFollowing = '/api/v1/accounts/{0}/following';
    followHashtag = '/api/v1/tags/{0}/follow';
    unfollowHashtag = '/api/v1/tags/{0}/unfollow';
    getHashtag = '/api/v1/tags/{0}';
}
